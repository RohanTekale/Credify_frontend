// src/components/CredilyChatbot.jsx
// Credily — Credify's floating support chatbot
// Drop <CredilyChatbot /> anywhere in App.jsx (outside <Routes>) and it appears on every page
import React, { useState, useRef, useEffect, useCallback } from 'react';

const QA = [
  {
    keys: ['approval', 'approve', 'payment approval', 'pending approval', 'who approves'],
    chips: ['How do approval chains work?', 'Set approval thresholds', 'What is Tier 3 approval?'],
    reply: `Credify routes every payment through your configured approval chain.\n\nHow it works:\n• Payments below your Tier 1 threshold → auto-approved\n• Mid-range payments → routed to Finance Manager\n• Large payments → escalated to CFO\n\nConfigure thresholds at Dashboard → Approvals → Threshold Rules. Every decision is logged with actor, timestamp, and IP.`,
  },
  {
    keys: ['reconciliation', 'recon', 'settlement', 'mismatch', 'closing books'],
    chips: ['When does recon run?', 'What is a mismatch?', 'How to raise a dispute?'],
    reply: `Credify runs reconciliation automatically.\n\nWhat happens:\n• Credify fetches your gateway settlement file nightly\n• Compares it line-by-line against your internal records\n• Flags mismatches as: fee variance, timing diff, or missing credit\n\nView results at Dashboard → Reconciliation → Latest Run. Dispute a mismatch with one click.`,
  },
  {
    keys: ['webhook', 'duplicate', 'event', 'idempotent', 'delivery', 'dlq', 'dead letter'],
    chips: ['How are duplicates detected?', 'What is the DLQ?', 'Webhook delivery rate?'],
    reply: `Credify handles webhook deduplication automatically.\n\nHow it works:\n• Every inbound event is fingerprinted by gateway event ID\n• On first receipt, the ID is stored\n• Any retry carrying the same ID is dropped in <5ms\n\nFailed events after 3 retries go to the Dead-Letter Queue for manual inspection. Check Dashboard → Webhooks → Event Log.`,
  },
  {
    keys: ['gateway', 'razorpay', 'stripe', 'connect', 'integration', 'api key'],
    chips: ['Which gateways are supported?', 'How to connect Razorpay?', 'API key setup'],
    reply: `Credify supports Razorpay and Stripe out of the box.\n\nTo connect:\n1. Go to Dashboard → Integrations → Gateway Connectors\n2. Enter your gateway API key and webhook secret\n3. Credify validates the connection and starts syncing\n\nCustom gateways can be added via CSV upload or REST API. No code changes needed.`,
  },
  {
    keys: ['threshold', 'tier', 'limit', 'amount', 'rule', 'configure'],
    chips: ['Set approval tiers', 'Who can configure rules?', 'SLA for approvals?'],
    reply: `Approval thresholds are fully configurable.\n\nDefault setup:\n• Tier 1: < ₹50K → auto-approve\n• Tier 2: ₹50K–₹5L → Finance Manager\n• Tier 3: > ₹5L → CFO\n\nEach tier has a configurable SLA. Breached SLAs auto-escalate to the backup approver. Configure at Dashboard → Approvals → Threshold Rules.`,
  },
  {
    keys: ['kyc', 'verify', 'verification', 'document', 'identity', 'upload'],
    chips: ['Documents needed', 'How long does KYC take?', 'KYC rejected?'],
    reply: `KYC is required to unlock all platform features.\n\nDocuments accepted:\n• Aadhaar Card\n• PAN Card\n• Passport\n\nSteps: Dashboard → KYC → Upload documents → Liveness check\n\nVerification usually completes in 30 minutes during business hours.`,
  },
  {
    keys: ['password', 'forgot', 'reset', 'login', 'locked', '2fa', 'account', 'access'],
    chips: ['Reset password', 'Enable 2FA', 'Account locked?'],
    reply: `Account access help:\n\nForgot password?\nClick "Forgot Password" on login → check email for reset link (valid 15 min).\n\nAccount locked?\nAfter 5 failed attempts, it locks for 30 minutes.\n\nEnable 2FA: Dashboard → Profile → Security → Two-Factor Auth.`,
  },
  {
    keys: ['hello', 'hi', 'hey', 'help', 'support', 'what can you do'],
    chips: ['How do approvals work?', 'Set up reconciliation', 'Webhook deduplication', 'Connect a gateway'],
    reply: `Hey! I'm Credily — Credify's finance ops assistant.\n\nI can help you with:\n• Payment approval chains & thresholds\n• Automated reconciliation & mismatches\n• Webhook deduplication & event logs\n• Gateway connections (Razorpay, Stripe)\n• KYC & account security\n\nWhat are you working on?`,
  },
];

const DEFAULT_CHIPS = ['How do approvals work?', 'Set up reconciliation', 'Webhook deduplication', 'Connect a gateway', 'KYC help', 'Account security'];

const FALLBACK = `Hmm, I'm not sure about that one! Here's what I can help with:\n\n• Payment approval chains & thresholds\n• Automated reconciliation & mismatches\n• Webhook deduplication & event logs\n• Gateway connections (Razorpay, Stripe)\n• KYC & account security\n\nFor complex issues, email support@credify.io — we respond within 4 hours.`;

const WELCOME = `Hey! I'm Credily — Credify's finance ops assistant.\n\nHow can I help you today?`;

// ── Icons ────────────────────────────────────────────────────────────────────
const FaceIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2">
    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3" strokeLinecap="round" />
    <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const SendIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const CloseIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// ── Typing dots ──────────────────────────────────────────────────────────────
const TypingIndicator = () => (
  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
    <BotAvatar />
    <div style={{
      display: 'flex', gap: 5, padding: '10px 14px',
      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '4px 14px 14px 14px',
    }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 6, height: 6, borderRadius: '50%', background: '#6089ff',
          animation: `crDot 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
    </div>
  </div>
);

const BotAvatar = () => (
  <div style={{
    width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
    background: 'linear-gradient(135deg,#3b61f5,#7c3aed)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2,
  }}>
    <FaceIcon size={13} />
  </div>
);

// ── Message bubble ───────────────────────────────────────────────────────────
const Message = ({ msg }) => {
  const isBot = msg.role === 'bot';
  return (
    <div style={{
      display: 'flex', gap: 8, flexDirection: isBot ? 'row' : 'row-reverse',
      animation: 'crMsgIn 240ms cubic-bezier(0.16,1,0.3,1)',
    }}>
      {isBot
        ? <BotAvatar />
        : (
          <div style={{
            width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
            background: 'rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, color: '#aaa', fontWeight: 700, marginTop: 2,
          }}>U</div>
        )
      }
      <div style={{
        maxWidth: 230, padding: '9px 13px', borderRadius: isBot ? '4px 14px 14px 14px' : '14px 4px 14px 14px',
        fontSize: 13, lineHeight: 1.55, wordBreak: 'break-word',
        ...(isBot
          ? { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: '#e2e8f0', whiteSpace: 'pre-line' }
          : { background: 'linear-gradient(135deg,#3b61f5,#5b48e8)', color: '#fff' }
        ),
      }}>
        {msg.text}
      </div>
    </div>
  );
};

// ── Main component ───────────────────────────────────────────────────────────
const CredilyChatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chips, setChips] = useState(DEFAULT_CHIPS);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const msgEndRef = useRef(null);

  const scroll = () => msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => { scroll(); }, [messages, isTyping]);

  const openChat = () => {
    setOpen(true);
    if (!hasOpened) {
      setHasOpened(true);
      setTimeout(() => {
        addBotMessage(WELCOME, DEFAULT_CHIPS);
      }, 300);
    }
  };

  const addBotMessage = useCallback((text, newChips) => {
    setIsTyping(true);
    setChips([]);
    const delay = 800 + Math.random() * 700;
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'bot', text }]);
      if (newChips) setChips(newChips);
      setIsTyping(false);
    }, delay);
  }, []);

  const findAnswer = (text) => {
    const t = text.toLowerCase();
    return QA.find(qa => qa.keys.some(k => t.includes(k))) || null;
  };

  const sendMessage = useCallback((text) => {
    if (!text.trim() || isTyping) return;
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInputVal('');
    setChips([]);
    const qa = findAnswer(text);
    addBotMessage(qa ? qa.reply : FALLBACK, qa ? qa.chips : DEFAULT_CHIPS);
  }, [isTyping, addBotMessage]);

  return (
    <>
      <style>{`
        @keyframes crPulse{0%{transform:scale(1);opacity:.6}70%{transform:scale(1.45);opacity:0}100%{transform:scale(1.45);opacity:0}}
        @keyframes crFabIn{from{opacity:0;transform:scale(0.6)}to{opacity:1;transform:scale(1)}}
        @keyframes crWinIn{from{opacity:0;transform:scale(0.88) translateY(20px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes crMsgIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes crDot{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}
        @keyframes crStatusPulse{0%,100%{opacity:1}50%{opacity:.35}}
        @keyframes crTeaserIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        .cr-chip-btn{padding:5px 12px;border-radius:20px;background:rgba(59,97,245,0.12);border:1px solid rgba(59,97,245,0.28);color:#6089ff;font-size:11px;cursor:pointer;transition:all 150ms;white-space:nowrap;font-weight:500;font-family:inherit}
        .cr-chip-btn:hover{background:rgba(59,97,245,0.24);border-color:rgba(59,97,245,0.5);transform:translateY(-1px)}
        .cr-input-field{flex:1;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:8px 14px;font-size:13px;color:#f0f4ff;outline:none;font-family:inherit;transition:border-color 150ms}
        .cr-input-field::placeholder{color:#4b5675}
        .cr-input-field:focus{border-color:rgba(59,97,245,0.5)}
        .cr-msg-scroll::-webkit-scrollbar{width:3px}
        .cr-msg-scroll::-webkit-scrollbar-thumb{background:rgba(59,97,245,0.3);border-radius:3px}
      `}</style>

      {/* Floating launcher */}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>

        {/* Teaser bubble (before first open) */}
        {!open && !hasOpened && (
          <div style={{
            background: 'rgba(10,14,26,0.96)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12, padding: '9px 14px', color: '#f0f4ff', fontSize: 13,
            whiteSpace: 'nowrap', animation: 'crTeaserIn 400ms ease',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          }}>
            Hi! I'm <span style={{ color: '#6089ff', fontWeight: 700 }}>Credily</span> — need help? 👋
          </div>
        )}

        {/* Chat window */}
        {open && (
          <div style={{
            width: 340, height: 520,
            background: 'rgba(8,12,20,0.98)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 20, display: 'flex', flexDirection: 'column', overflow: 'hidden',
            boxShadow: '0 24px 60px rgba(0,0,0,0.65)',
            animation: 'crWinIn 280ms cubic-bezier(0.16,1,0.3,1)',
          }}>

            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg,#111827,#0d1321)',
              padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10,
              borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg,#3b61f5,#7c3aed)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', boxShadow: '0 4px 14px rgba(59,97,245,0.4)',
              }}>
                <FaceIcon size={17} />
                <div style={{
                  position: 'absolute', bottom: 0, right: 0,
                  width: 10, height: 10, borderRadius: '50%',
                  background: '#10b981', border: '2px solid #111827',
                }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#f0f4ff', fontFamily: 'Sora,sans-serif', letterSpacing: '-0.01em' }}>
                  Credily
                </div>
                <div style={{ fontSize: 11, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'crStatusPulse 2s ease-in-out infinite' }} />
                  Online · replies instantly
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: '50%',
                  width: 28, height: 28, cursor: 'pointer', color: '#8b96b0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 150ms',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.color = '#f87171'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#8b96b0'; }}
              >
                <CloseIcon />
              </button>
            </div>

            {/* Messages */}
            <div
              className="cr-msg-scroll"
              style={{ flex: 1, overflowY: 'auto', padding: '14px 12px 8px', display: 'flex', flexDirection: 'column', gap: 10 }}
            >
              {messages.map((m, i) => <Message key={i} msg={m} />)}
              {isTyping && <TypingIndicator />}
              <div ref={msgEndRef} />
            </div>

            {/* Quick chips */}
            {chips.length > 0 && (
              <div style={{ padding: '6px 12px 6px', display: 'flex', gap: 6, flexWrap: 'wrap', flexShrink: 0 }}>
                {chips.map((c, i) => (
                  <button key={i} className="cr-chip-btn" onClick={() => sendMessage(c)}>{c}</button>
                ))}
              </div>
            )}

            {/* Input */}
            <div style={{
              padding: '8px 12px 10px', borderTop: '1px solid rgba(255,255,255,0.07)',
              display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0,
            }}>
              <input
                className="cr-input-field"
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') sendMessage(inputVal); }}
                placeholder="Ask Credily anything…"
                disabled={isTyping}
              />
              <button
                onClick={() => sendMessage(inputVal)}
                disabled={isTyping || !inputVal.trim()}
                style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: isTyping || !inputVal.trim()
                    ? 'rgba(59,97,245,0.3)'
                    : 'linear-gradient(135deg,#3b61f5,#5b48e8)',
                  border: 'none', cursor: isTyping ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, transition: 'all 150ms',
                }}
              >
                <SendIcon />
              </button>
            </div>

            <div style={{ textAlign: 'center', padding: '0 12px 8px', fontSize: 10, color: '#2a3050' }}>
              Powered by Credify · Always here to help
            </div>
          </div>
        )}

        {/* FAB button */}
        <button
          onClick={() => open ? setOpen(false) : openChat()}
          style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'linear-gradient(135deg,#3b61f5,#7c3aed)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(59,97,245,0.5)',
            transition: 'transform 200ms, box-shadow 200ms',
            position: 'relative',
            animation: 'crFabIn 400ms cubic-bezier(0.16,1,0.3,1)',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(59,97,245,0.65)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(59,97,245,0.5)'; }}
        >
          {/* Pulse ring */}
          {!open && (
            <div style={{
              position: 'absolute', inset: -5, borderRadius: '50%',
              border: '2px solid rgba(59,97,245,0.4)',
              animation: 'crPulse 2.4s ease-out infinite',
              pointerEvents: 'none',
            }} />
          )}

          {/* Unread dot */}
          {!open && !hasOpened && (
            <div style={{
              position: 'absolute', top: -1, right: -1,
              width: 16, height: 16, borderRadius: '50%',
              background: '#10b981', border: '2px solid #0f0f1c',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9, color: '#fff', fontWeight: 700,
            }}>1</div>
          )}

          {/* Icon toggle */}
          {open ? (
            <CloseIcon />
          ) : (
            <FaceIcon size={22} />
          )}
        </button>
      </div>
    </>
  );
};

export default CredilyChatbot;
