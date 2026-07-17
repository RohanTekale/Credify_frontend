// src/components/ops/index.jsx
// Finance-ops UI primitives: StatusBadge, ApprovalStepper, OpsKpiStrip
// Used across Home, Features, and the dashboard.

import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2, Clock, XCircle, AlertCircle, ArrowRight,
  TrendingUp, TrendingDown, Zap, Activity, Shield,
  RefreshCw, AlertTriangle, CheckSquare,
} from 'lucide-react';

// ── Design tokens ─────────────────────────────────────────────────────────────
const STATUS_MAP = {
  approved:    { label: 'Approved',    color: '#10b981', bg: 'rgba(16,185,129,0.12)', Icon: CheckCircle2  },
  pending:     { label: 'Pending',     color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  Icon: Clock         },
  rejected:    { label: 'Rejected',    color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   Icon: XCircle       },
  escalated:   { label: 'Escalated',   color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', Icon: AlertCircle   },
  matched:     { label: 'Matched',     color: '#10b981', bg: 'rgba(16,185,129,0.12)', Icon: CheckCircle2  },
  mismatch:    { label: 'Mismatch',    color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   Icon: AlertTriangle },
  processing:  { label: 'Processing',  color: '#3b61f5', bg: 'rgba(59,97,245,0.12)',   Icon: RefreshCw     },
  delivered:   { label: 'Delivered',   color: '#10b981', bg: 'rgba(16,185,129,0.12)', Icon: CheckCircle2  },
  duplicate:   { label: 'Duplicate',   color: '#94a3b8', bg: 'rgba(148,163,184,0.12)',Icon: XCircle       },
  failed:      { label: 'Failed',      color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   Icon: XCircle       },
};

// ── StatusBadge ───────────────────────────────────────────────────────────────
export const StatusBadge = ({ status, size = 'sm', showIcon = true }) => {
  const cfg = STATUS_MAP[status] || STATUS_MAP.pending;
  const { label, color, bg, Icon } = cfg;
  const fontSize = size === 'sm' ? 11 : 13;
  const iconSize = size === 'sm' ? 10 : 13;
  const padding  = size === 'sm' ? '3px 8px' : '5px 12px';

  return (
    <span style={{
      display:     'inline-flex',
      alignItems:  'center',
      gap:         4,
      padding,
      borderRadius: 999,
      background:  bg,
      color,
      fontSize,
      fontWeight:  600,
      fontFamily:  "'DM Sans','Sora',sans-serif",
      letterSpacing: '0.01em',
      whiteSpace:  'nowrap',
      border:      `1px solid ${color}22`,
    }}>
      {showIcon && <Icon size={iconSize} strokeWidth={2.2} />}
      {label}
    </span>
  );
};

// ── ApprovalStepper ───────────────────────────────────────────────────────────
// Shows a multi-tier approval chain with current active step
export const ApprovalStepper = ({
  steps = [
    { role: 'Auto-approve', limit: '< ₹50K',   status: 'approved' },
    { role: 'Finance Mgr',  limit: '₹50K–5L',  status: 'pending' },
    { role: 'CFO',          limit: '> ₹5L',     status: 'pending' },
  ],
  amount = '₹1,20,000',
  compact = false,
}) => {
  const activeIdx = steps.findIndex(s => s.status === 'pending');

  return (
    <div style={{
      background:    'var(--dash-card-bg, rgba(255,255,255,0.05))',
      border:        '1px solid var(--dash-card-border, rgba(59,97,245,0.15))',
      borderRadius:  16,
      padding:       compact ? '16px' : '24px',
      fontFamily:    "'DM Sans','Sora',sans-serif",
    }}>
      {!compact && (
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#3b61f5', letterSpacing: '0.08em', marginBottom: 4 }}>
            APPROVAL CHAIN
          </p>
          <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary, #fff)' }}>
            {amount}
          </p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {steps.map((step, i) => {
          const isActive   = i === activeIdx;
          const isDone     = step.status === 'approved';
          const isPending  = step.status === 'pending' && i !== activeIdx;
          const lineColor  = isDone ? '#10b981' : isActive ? '#3b61f5' : 'var(--border, rgba(255,255,255,0.08))';

          return (
            <div key={i} style={{ display: 'flex', gap: 12 }}>
              {/* Spine */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div style={{
                  width:  28,
                  height: 28,
                  borderRadius: '50%',
                  background:   isDone ? '#10b981' : isActive ? '#3b61f5' : 'var(--bg-subtle, rgba(255,255,255,0.04))',
                  border:       `2px solid ${lineColor}`,
                  display:      'flex',
                  alignItems:   'center',
                  justifyContent: 'center',
                  transition:   'all 0.3s ease',
                  boxShadow:    isActive ? '0 0 0 4px rgba(59,97,245,0.2)' : 'none',
                }}>
                  {isDone
                    ? <CheckCircle2 size={14} color="#fff" />
                    : isActive
                      ? <Clock size={14} color="#fff" />
                      : <span style={{ fontSize: 10, color: 'var(--text-muted, #666)', fontWeight: 600 }}>{i + 1}</span>
                  }
                </div>
                {i < steps.length - 1 && (
                  <div style={{
                    width:      2,
                    flex:       1,
                    minHeight:  24,
                    background: isDone ? '#10b981' : 'var(--border, rgba(255,255,255,0.08))',
                    margin:     '4px 0',
                    borderRadius: 1,
                    transition: 'background 0.3s ease',
                  }} />
                )}
              </div>

              {/* Content */}
              <div style={{
                paddingBottom: i < steps.length - 1 ? 16 : 0,
                paddingTop:    2,
                flex:          1,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <div>
                    <p style={{
                      fontSize:   compact ? 12 : 14,
                      fontWeight: 600,
                      color:      isActive ? 'var(--text-primary, #fff)' : 'var(--text-secondary, #94a3b8)',
                      marginBottom: 2,
                      transition: 'color 0.2s ease',
                    }}>
                      {step.role}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted, #64748b)' }}>{step.limit}</p>
                  </div>
                  <StatusBadge status={step.status} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── OpsKpiStrip ───────────────────────────────────────────────────────────────
// Top-of-dashboard KPI strip with animated counters
const MOCK_KPIS = [
  {
    id: 'volume',
    label: 'Payment Volume (today)',
    value: '₹4.2 Cr',
    delta: '+12%',
    positive: true,
    color: '#3b61f5',
    Icon: Activity,
    spark: [42, 48, 44, 61, 58, 72, 68, 79, 84, 91],
  },
  {
    id: 'approval-queue',
    label: 'Pending Approvals',
    value: '7',
    delta: '-3 from yesterday',
    positive: true,
    color: '#f59e0b',
    Icon: CheckSquare,
    spark: [14, 12, 18, 9, 11, 7, 10, 8, 9, 7],
  },
  {
    id: 'recon-status',
    label: 'Recon Status',
    value: '99.1%',
    delta: '3 mismatches',
    positive: false,
    color: '#10b981',
    Icon: RefreshCw,
    spark: [96, 98, 99, 97, 99, 99, 100, 99, 98, 99],
  },
  {
    id: 'webhooks',
    label: 'Webhooks Delivered',
    value: '1,482',
    delta: '12 duplicates dropped',
    positive: true,
    color: '#06b6d4',
    Icon: Zap,
    spark: [120, 134, 118, 145, 139, 152, 148, 161, 157, 166],
  },
];

const MiniSpark = ({ data, color }) => {
  const w = 72, h = 28;
  const min = Math.min(...data), max = Math.max(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(' ');
  const id = `kpi-spark-${color.replace('#', '')}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: w, height: h }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`${pts} ${w},${h} 0,${h}`} fill={`url(#${id})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export const OpsKpiStrip = ({ kpis = MOCK_KPIS, columns = 4 }) => (
  <div style={{
    display:             'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap:                 12,
    fontFamily:          "'DM Sans','Sora',sans-serif",
  }}>
    {kpis.map(({ id, label, value, delta, positive, color, Icon, spark }) => (
      <div key={id} style={{
        padding:    '16px 20px',
        borderRadius: 16,
        background:  'var(--dash-card-bg, rgba(255,255,255,0.04))',
        border:      `1px solid var(--dash-card-border, rgba(59,97,245,0.12))`,
        position:    'relative',
        overflow:    'hidden',
      }}>
        {/* top accent line */}
        <div style={{
          position:   'absolute', top: 0, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: `${color}15`, border: `1px solid ${color}25`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={15} color={color} />
          </div>
          <MiniSpark data={spark} color={color} />
        </div>

        <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary, #fff)', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 4 }}>
          {value}
        </p>
        <p style={{ fontSize: 11, color: 'var(--text-secondary, #94a3b8)', marginBottom: 4 }}>
          {label}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {positive ? <TrendingUp size={11} color="#10b981" /> : <TrendingDown size={11} color="#f59e0b" />}
          <span style={{ fontSize: 11, fontWeight: 600, color: positive ? '#10b981' : '#f59e0b' }}>
            {delta}
          </span>
        </div>
      </div>
    ))}
  </div>
);

// ── WebhookEventRow ───────────────────────────────────────────────────────────
export const WebhookEventRow = ({ eventId, type, gateway, status, ts, compact = false }) => (
  <div style={{
    display:      'flex',
    alignItems:   'center',
    gap:          12,
    padding:      compact ? '8px 0' : '12px 16px',
    borderBottom: '1px solid var(--dash-row-divider, rgba(255,255,255,0.05))',
    fontFamily:   "'DM Sans','Sora',sans-serif",
  }}>
    <StatusBadge status={status} />
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary, #fff)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {type}
      </p>
      <code style={{ fontSize: 10, color: 'var(--text-muted, #64748b)', fontFamily: "'JetBrains Mono',monospace" }}>
        {eventId}
      </code>
    </div>
    <span style={{ fontSize: 11, color: 'var(--text-muted, #64748b)', whiteSpace: 'nowrap' }}>
      {gateway}
    </span>
    <span style={{ fontSize: 11, color: 'var(--text-muted, #64748b)', whiteSpace: 'nowrap' }}>
      {ts}
    </span>
  </div>
);

export default { StatusBadge, ApprovalStepper, OpsKpiStrip, WebhookEventRow };
