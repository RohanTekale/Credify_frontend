// src/content/credifyStory.js
// Single source of truth for all copy, stats, and structured content.
// Finance-ops language — Credify sits ON TOP of payment gateways.

export const BRAND = {
  name: 'Credify',
  tagline: 'Finance operations, finally in control.',
  subTagline: 'Multi-step approvals, automated reconciliation, and real-time ops visibility — all in one platform.',
  accent: '#3b61f5',
};

export const STATS = [
  { value: '99.97', suffix: '%', label: 'Webhook delivery rate' },
  { value: '2.4', suffix: 'hr', label: 'Avg reconciliation time (was 3 days)' },
  { value: '₹0', suffix: '', label: 'Unauthorised payments post-Credify' },
  { value: '12', suffix: 'x', label: 'Faster approval turnaround' },
];

// ── The 4 problems Credify solves ────────────────────────────────────────────
export const PROBLEMS = [
  {
    id: 'approval',
    icon: 'Shield',
    color: '#ef4444',
    headline: 'Payments approved by anyone, for any amount.',
    body: 'A junior ops member could push a ₹40L vendor payment straight to Razorpay. No escalation, no second pair of eyes, no audit trail.',
    stat: '63% of payment fraud starts with a bypassed approval.',
  },
  {
    id: 'reconciliation',
    icon: 'RefreshCw',
    color: '#f59e0b',
    headline: 'Settlement files reconciled by hand, every night.',
    body: 'Finance teams spend hours comparing internal transaction logs against gateway settlement CSVs — error-prone, slow, and completely manual.',
    stat: '3+ days to close books. Every. Single. Month.',
  },
  {
    id: 'visibility',
    icon: 'BarChart3',
    color: '#8b5cf6',
    headline: 'Nobody knows what\'s happening in real time.',
    body: 'When a payment gateway has an incident, ops teams find out from customers — not from their own dashboard.',
    stat: 'Average detection lag: 47 minutes.',
  },
  {
    id: 'webhooks',
    icon: 'Zap',
    color: '#06b6d4',
    headline: 'Duplicate webhooks fire, orders ship twice.',
    body: 'Razorpay retries events. Without idempotency, each retry may trigger fulfilment, notifications, or ledger entries again.',
    stat: '1 in 800 webhooks arrives as a duplicate.',
  },
];

// ── The 4 solutions ──────────────────────────────────────────────────────────
export const SOLUTIONS = [
  {
    id: 'approvals',
    icon: 'CheckSquare',
    color: '#3b61f5',
    headline: 'Multi-step approval chains by amount threshold.',
    body: 'Define rules: payments under ₹50K auto-approve, ₹50K–5L require a manager, above ₹5L escalate to CFO. Every decision is logged, timestamped, and auditable.',
    badge: 'Approval Engine',
    metrics: ['Configurable thresholds', 'Email + in-app alerts', 'Full audit trail'],
  },
  {
    id: 'reconciliation',
    icon: 'GitMerge',
    color: '#10b981',
    headline: 'Nightly automated reconciliation vs gateway settlement.',
    body: 'Credify fetches your Razorpay/Stripe settlement files, compares them against internal records, flags mismatches, and surfaces a clean diff — no spreadsheets.',
    badge: 'Recon Engine',
    metrics: ['Auto-fetch settlement files', 'Mismatch flagging', 'One-click dispute initiation'],
  },
  {
    id: 'ops-dashboard',
    icon: 'Monitor',
    color: '#8b5cf6',
    headline: 'Real-time operations command centre.',
    body: 'Live payment volume, approval queue depth, gateway health, and settlement status — all on one screen your ops team actually monitors.',
    badge: 'Ops Dashboard',
    metrics: ['Live payment feed', 'Gateway health monitor', 'Configurable alerts'],
  },
  {
    id: 'webhooks',
    icon: 'Webhook',
    color: '#06b6d4',
    headline: 'Idempotent webhook handling — duplicates silently dropped.',
    body: 'Every inbound event is fingerprinted by its gateway event ID. Retries and duplicates are detected and discarded before they touch your business logic.',
    badge: 'Webhook Layer',
    metrics: ['Event ID deduplication', 'Retry-safe processing', 'Dead-letter queue'],
  },
];

// ── Features page deep sections ──────────────────────────────────────────────
export const FEATURE_SECTIONS = [
  {
    id: 'approval-engine',
    anchor: 'approvals',
    eyebrow: 'APPROVAL ENGINE',
    headline: 'Define who can approve what, and for how much.',
    description: 'Multi-level approval chains configured per amount threshold. Works across your org chart without any custom code.',
    color: '#3b61f5',
    icon: 'CheckSquare',
    details: [
      { label: 'Threshold rules', desc: 'Set amount bands — auto-approve, single-approver, or multi-step escalation.' },
      { label: 'Role-based routing', desc: 'Payments route to the right approver based on amount, category, and department.' },
      { label: 'Approval SLA alerts', desc: 'Pending approvals past SLA automatically escalate and notify backup approvers.' },
      { label: 'Immutable audit log', desc: 'Every approve, reject, and comment is stored with actor, timestamp, and IP.' },
    ],
    demo: 'approval-stepper',
  },
  {
    id: 'reconciliation-engine',
    anchor: 'reconciliation',
    eyebrow: 'RECONCILIATION ENGINE',
    headline: 'Close your books in hours, not days.',
    description: 'Credify fetches gateway settlement files, compares them against your internal ledger, and surfaces every mismatch with a one-click path to resolution.',
    color: '#10b981',
    icon: 'GitMerge',
    details: [
      { label: 'Gateway connectors', desc: 'Razorpay and Stripe supported out of the box. Plug in any gateway via CSV or API.' },
      { label: 'Delta report', desc: 'Side-by-side diff of internal vs gateway amounts with match status per transaction.' },
      { label: 'Auto-categorise mismatches', desc: 'Fee variance, timing difference, or genuine missing credit — each tagged automatically.' },
      { label: 'Dispute initiation', desc: 'Flag a mismatch and raise a gateway dispute with one click, pre-filled with context.' },
    ],
    demo: 'recon-table',
  },
  {
    id: 'ops-dashboard',
    anchor: 'dashboard',
    eyebrow: 'OPS DASHBOARD',
    headline: 'Your payment operations, live — not 20 minutes stale.',
    description: 'A finance command centre that shows payment volume, approval queue, gateway health, and settlement status as they happen.',
    color: '#8b5cf6',
    icon: 'Monitor',
    details: [
      { label: 'Live payment feed', desc: 'Sub-second latency feed of every payment event from connected gateways.' },
      { label: 'Approval queue depth', desc: 'See pending approvals by tier and SLA status at a glance.' },
      { label: 'Gateway health strip', desc: 'Real-time Razorpay / Stripe API latency, error rate, and incident status.' },
      { label: 'Alert rules', desc: 'Threshold-based alerts — volume spike, approval backlog, or recon failure.' },
    ],
    demo: 'kpi-strip',
  },
  {
    id: 'webhook-engine',
    anchor: 'webhooks',
    eyebrow: 'WEBHOOK ENGINE',
    headline: 'Idempotent by design. Duplicates never reach your code.',
    description: 'Credify sits in front of your webhook handler. Every inbound event is fingerprinted, deduplicated, and only forwarded once — regardless of how many retries the gateway sends.',
    color: '#06b6d4',
    icon: 'Webhook',
    details: [
      { label: 'Event ID fingerprinting', desc: 'SHA-256 hash of gateway event ID stored on first receipt. Duplicates rejected in <5ms.' },
      { label: 'Retry-safe processing', desc: 'Even if your handler crashes mid-flight, Credify replays exactly once on recovery.' },
      { label: 'Dead-letter queue', desc: 'Events that fail processing after 3 retries land in DLQ for manual inspection.' },
      { label: 'Event log', desc: 'Full searchable history of every received event, delivery status, and handler response code.' },
    ],
    demo: 'webhook-log',
  },
];

// ── Pricing ──────────────────────────────────────────────────────────────────
export const PLANS = [
  {
    name: 'Growth',
    price: '₹4,999',
    period: '/ month',
    desc: 'For finance teams handling up to ₹5 Cr/month in payment volume.',
    features: [
      '2 payment gateway connectors',
      'Multi-step approvals (3 tiers)',
      'Nightly reconciliation',
      'Webhook deduplication',
      'Ops dashboard',
      'Email alerts',
      '30-day audit log retention',
    ],
    cta: 'Start free trial',
    highlight: false,
  },
  {
    name: 'Scale',
    price: '₹14,999',
    period: '/ month',
    desc: 'For ops teams managing high payment volume across multiple gateways.',
    features: [
      'Unlimited gateway connectors',
      'Unlimited approval tiers + custom roles',
      'Real-time reconciliation (not just nightly)',
      'Webhook DLQ + replay',
      'Live ops command centre',
      'Slack + PagerDuty alerts',
      '1-year audit log retention',
      'Priority support (4hr SLA)',
    ],
    cta: 'Start free trial',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'For mid-to-large companies with complex compliance and integration needs.',
    features: [
      'Everything in Scale',
      'SSO / SAML integration',
      'Custom approval workflow builder',
      'Dedicated implementation engineer',
      'On-premise deployment option',
      'SOC 2 report on request',
      'Custom SLA and uptime guarantee',
    ],
    cta: 'Talk to sales',
    highlight: false,
  },
];

// ── FAQ ──────────────────────────────────────────────────────────────────────
export const FAQS = [
  {
    category: 'Product',
    q: 'What exactly is Credify?',
    a: 'Credify is a finance operations layer that sits on top of your existing payment gateways (Razorpay, Stripe, etc.). It adds multi-step payment approvals, automated reconciliation, real-time ops visibility, and idempotent webhook handling — without replacing your gateway or your bank.',
  },
  {
    category: 'Product',
    q: 'Does Credify replace our payment gateway?',
    a: 'No. Credify connects to gateways you already use. It adds control and visibility on top — approvals before a payment fires, reconciliation after settlement lands, and webhook deduplication in between.',
  },
  {
    category: 'Approvals',
    q: 'How do approval chains work?',
    a: 'You configure amount thresholds and approver roles in the dashboard. A payment under ₹50K might auto-approve; ₹50K–5L routes to a Finance Manager; above ₹5L escalates to the CFO. Each step has a configurable SLA and backup approver.',
  },
  {
    category: 'Reconciliation',
    q: 'What does the reconciliation engine compare?',
    a: 'It compares your internal payment records against gateway settlement files — amount, status, and timing. Mismatches are automatically categorised (fee variance, timing difference, or missing credit) and surfaced in the dashboard.',
  },
  {
    category: 'Webhooks',
    q: 'How does webhook deduplication work?',
    a: 'Credify fingerprints every inbound webhook by its gateway event ID. On the first receipt, the ID is stored. Any retry or duplicate carrying the same ID is detected in under 5ms and dropped before it reaches your application code.',
  },
  {
    category: 'Security',
    q: 'Is our financial data safe?',
    a: 'All data is encrypted at rest (AES-256) and in transit (TLS 1.3). Credify never stores card numbers or bank account credentials. Access to the platform is role-gated, and every action is written to an immutable audit log.',
  },
  {
    category: 'Integration',
    q: 'How long does integration take?',
    a: 'Most teams are live in under a day. You connect your gateway API keys, configure your approval rules, and point your webhook endpoint to Credify. No code changes required for core features.',
  },
  {
    category: 'Support',
    q: 'What support is included?',
    a: 'Growth plan includes email support. Scale includes priority support with a 4-hour response SLA. Enterprise customers get a dedicated implementation engineer and a named account manager.',
  },
];

// ── Sidebar / Dashboard nav ──────────────────────────────────────────────────
export const OPS_SIDEBAR = {
  overview: {
    title: 'Overview',
    items: ['kpi-strip', 'live-feed', 'gateway-health', 'pending-approvals'],
  },
  payments: {
    title: 'Payments',
    items: ['all-payments', 'pending', 'failed', 'refunds'],
  },
  approvals: {
    title: 'Approvals',
    items: ['queue', 'history', 'rules', 'escalations'],
  },
  reconciliation: {
    title: 'Reconciliation',
    items: ['latest-run', 'mismatches', 'history', 'dispute-log'],
  },
  webhooks: {
    title: 'Webhooks',
    items: ['event-log', 'duplicates-dropped', 'dlq', 'endpoints'],
  },
  reports: {
    title: 'Reports',
    items: ['settlement', 'approval-summary', 'recon-summary', 'audit-log'],
  },
};

export default {
  BRAND,
  STATS,
  PROBLEMS,
  SOLUTIONS,
  FEATURE_SECTIONS,
  PLANS,
  FAQS,
  OPS_SIDEBAR,
};
