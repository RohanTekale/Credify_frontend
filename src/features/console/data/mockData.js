// src/features/console/data/mockData.js
// Static pilot data for the Credify finance-ops console.
// Mirrors the approved design prototype 1:1 — swap for real API calls
// as each screen is wired to the backend.

export const kpis = [
  { label: 'Paid today',          value: '\u20B918.4L', delta: '\u25B2 12% vs yesterday', tone: 'up' },
  { label: 'Pending approval',    value: '\u20B96.2L',  delta: '3 requests waiting',       tone: 'wn' },
  { label: 'Failed payouts',      value: '2',          delta: 'needs retry decision',     tone: 'dn' },
  { label: 'Recon match rate',    value: '97.8%',       delta: '3 exceptions open',        tone: 'wn' },
];

export const waitingOnApproval = [
  { payment: 'Bluewave Logistics \u00B7 vendor invoice', amount: '\u20B92,00,000', role: 'FINANCE',  roleClass: 'r-fin' },
  { payment: 'Nimbus Cloud \u00B7 monthly infra',         amount: '\u20B984,500',  role: 'APPROVER', roleClass: 'r-app' },
  { payment: 'Refund batch #R-118',                       amount: '\u20B93,36,400', role: 'ADMIN',   roleClass: 'r-admin' },
];

export const recentGatewayEvents = [
  { event: 'payout.processed \u00B7 evt_9f2K', provider: 'Razorpay', status: 'Processed',          chip: 'c-green' },
  { event: 'payout.processed \u00B7 evt_9f2K', provider: 'Razorpay', status: 'Ignored \u00B7 duplicate', chip: 'c-grey' },
  { event: 'payout.failed \u00B7 evt_8xQ1',    provider: 'Razorpay', status: 'Failed',              chip: 'c-rose' },
];

export const payments = [
  { ref: 'PAY-2041', vendor: 'Bluewave Logistics',       amount: '\u20B92,00,000',  rail: 'NEFT', status: 'In approval \u00B7 2/3', chip: 'c-amber', by: 'Priya S.', action: 'View \u2192', clickable: true },
  { ref: 'PAY-2040', vendor: 'Nimbus Cloud Services',    amount: '\u20B984,500',    rail: 'IMPS', status: 'In approval \u00B7 1/2', chip: 'c-amber', by: 'Priya S.', action: 'View \u2192' },
  { ref: 'PAY-2039', vendor: 'Zenith Staffing',          amount: '\u20B94,80,000',  rail: 'NEFT', status: 'Settled',             chip: 'c-green', by: 'Rahul M.', action: 'View \u2192' },
  { ref: 'PAY-2038', vendor: 'Refund batch #R-118',      amount: '\u20B93,36,400',  rail: 'UPI',  status: 'In approval \u00B7 0/3', chip: 'c-amber', by: 'Priya S.', action: 'View \u2192' },
  { ref: 'PAY-2037', vendor: 'Kalinga Print Works',      amount: '\u20B97,900',     rail: 'UPI',  status: 'Auto-approved',        chip: 'c-blue',  by: 'Rahul M.', action: 'View \u2192' },
  { ref: 'PAY-2036', vendor: 'Meridian Interiors',       amount: '\u20B91,12,000',  rail: 'NEFT', status: 'Failed \u00B7 bank reject', chip: 'c-rose', by: 'Priya S.', action: 'Retry' },
  { ref: 'PAY-2035', vendor: 'Nimbus Cloud Services',    amount: '\u20B984,500',    rail: 'IMPS', status: 'Rejected \u00B7 budget hold', chip: 'c-grey', by: 'Priya S.', action: 'View \u2192' },
];

export const approvalsInbox = [
  { id: 'ap1', payment: 'Bluewave Logistics \u00B7 invoice BL-2291', amount: '\u20B92,00,000', step: '2 of 3', by: 'Priya S.', sla: '6h left',        chip: 'c-amber' },
  { id: 'ap2', payment: 'Nimbus Cloud \u00B7 monthly infra',          amount: '\u20B984,500',   step: '1 of 2', by: 'Priya S.', sla: '22h left',       chip: 'c-green' },
  { id: 'ap3', payment: 'Refund batch #R-118',                        amount: '\u20B93,36,400', step: '1 of 3', by: 'Priya S.', sla: 'SLA breached',   chip: 'c-rose'  },
];

export const reconKpis = [
  { label: 'Records compared',    value: '1,482' },
  { label: 'Auto-matched',        value: '1,449', tone: 'up', delta: '97.8%' },
  { label: 'Exceptions open',     value: '3', tone: 'wn', delta: 'needs human review' },
  { label: 'Duplicates ignored',  value: '12', delta: 'zero double-posts' },
];

export const reconExceptions = [
  { type: 'Amount mismatch',    chip: 'c-rose',  ref: 'PAY-2033',     internal: '\u20B956,000', gateway: '\u20B955,440', delta: '\u2212\u20B9560 (fee?)', deltaTone: 'dn' },
  { type: 'Missing internal',   chip: 'c-amber', ref: 'stl_88champs', internal: '\u2014',        gateway: '\u20B912,300', delta: 'unbooked', deltaTone: 'wn' },
  { type: 'Missing external',   chip: 'c-amber', ref: 'PAY-2029',     internal: '\u20B98,750',   gateway: '\u2014',        delta: 'not settled', deltaTone: 'wn' },
];

export const gatewayEvents = [
  { time: '12:31:04', id: 'evt_9f2Kd8', type: 'payout.processed', provider: 'Razorpay', payment: 'PAY-2039', status: 'Processed',            chip: 'c-green', dim: false },
  { time: '12:31:09', id: 'evt_9f2Kd8', type: 'payout.processed', provider: 'Razorpay', payment: 'PAY-2039', status: 'Ignored \u00B7 duplicate', chip: 'c-grey', dim: true },
  { time: '12:31:17', id: 'evt_9f2Kd8', type: 'payout.processed', provider: 'Razorpay', payment: 'PAY-2039', status: 'Ignored \u00B7 duplicate', chip: 'c-grey', dim: true },
  { time: '11:58:40', id: 'evt_8xQ1p3', type: 'payout.failed',    provider: 'Razorpay', payment: 'PAY-2036', status: 'Failed \u2192 flagged',   chip: 'c-rose', dim: false },
  { time: '11:12:02', id: 'evt_7Yt5m1', type: 'payout.processed', provider: 'Razorpay', payment: 'PAY-2035', status: 'Processed',            chip: 'c-green', dim: false },
  { time: '10:47:55', id: 'evt_6Rw2z9', type: 'payout.initiated', provider: 'Razorpay', payment: 'PAY-2039', status: 'Acknowledged',         chip: 'c-blue', dim: false },
];

export const ledgerEntries = [
  { posted: '12:31:04', entry: 'Payout settled \u2014 Zenith Staffing',     payment: 'PAY-2039', debit: '\u20B94,80,000', credit: '\u2014',    source: 'evt_9f2Kd8' },
  { posted: '12:31:04', entry: 'Gateway fee',                                payment: 'PAY-2039', debit: '\u20B9960',      credit: '\u2014',    source: 'evt_9f2Kd8' },
  { posted: '11:12:02', entry: 'Payout settled \u2014 Kalinga Print',       payment: 'PAY-2037', debit: '\u20B97,900',    credit: '\u2014',    source: 'evt_7Yt5m1' },
  { posted: '09:44:18', entry: 'Refund reversal \u2014 order #88112',       payment: 'PAY-2031', debit: '\u2014',        credit: '\u20B92,150', source: 'evt_5Qa8x2' },
];

export const policyBands = [
  { band: 'Below \u20B910,000',          chain: 'Auto-approve', chainType: 'blue',  version: 'v3', status: 'Active' },
  { band: '\u20B910,000 \u2013 \u20B91,00,000', chain: 'APPROVER',     chainType: 'single', version: 'v3', status: 'Active' },
  { band: 'Above \u20B91,00,000',         chain: 'APPROVER \u2192 FINANCE \u2192 ADMIN', chainType: 'multi', version: 'v3', status: 'Active' },
];

export const vendors = [
  { name: 'Bluewave Logistics',    account: 'HDFC ****4412',  ifsc: 'HDFC0001206', status: 'Penny-drop verified', chip: 'c-green', paid: '\u20B96,40,000' },
  { name: 'Nimbus Cloud Services', account: 'ICICI ****8071',  ifsc: 'ICIC0000442', status: 'Penny-drop verified', chip: 'c-green', paid: '\u20B92,53,500' },
  { name: 'Zenith Staffing',       account: 'SBI ****2290',    ifsc: 'SBIN0009981', status: 'Pending verification', chip: 'c-amber', paid: '\u20B94,80,000' },
  { name: 'Meridian Interiors',    account: 'AXIS ****5518',   ifsc: 'UTIB0001803', status: 'Verification failed',  chip: 'c-rose',  paid: '\u2014' },
];

export const roles = [
  { role: 'ADMIN',    roleClass: 'r-admin',  type: 'Built-in', members: 'Aarav K.', perms: 'Everything + manage roles, policies, integrations' },
  { role: 'FINANCE',  roleClass: 'r-fin',    type: 'Built-in', members: 'Meera T.', perms: 'Approve payments \u00B7 run recon \u00B7 resolve exceptions \u00B7 export audit' },
  { role: 'APPROVER', roleClass: 'r-app',    type: 'Built-in', members: 'Rahul M.', perms: 'Approve payments in assigned bands' },
  { role: 'OPS LEAD',  roleClass: 'r-custom', type: 'Custom',   members: 'Priya S.', perms: 'Initiate payments \u00B7 manage vendors \u00B7 view recon' },
];

export const approvalChain = [
  { status: 'ok',   title: 'Submitted',          who: 'Priya S.',  role: 'OPS LEAD', roleClass: 'r-custom', when: '10:12 AM' },
  { status: 'ok',   title: 'Step 1 \u00B7 Approved', who: 'Rahul M.',  role: 'APPROVER', roleClass: 'r-app', when: '10:40 AM \u00B7 \u201CInvoice verified\u201D' },
  { status: 'pend', title: 'Step 2 \u00B7 Waiting',  who: 'Meera T.',  role: 'FINANCE',  roleClass: 'r-fin', when: 'SLA: 6h remaining' },
  { status: 'wait', title: 'Step 3 \u00B7 CFO sign-off', who: 'Aarav K.', role: 'ADMIN', roleClass: 'r-admin', when: null, step: 3 },
];

export const demoSteps = [
  { n: 1, text: 'Create org & invite team', to: '/onboarding', label: 'Onboarding \u2192' },
  { n: 2, text: 'Set policy bands (\u20B92L \u21D2 3-step chain)', to: '/dashboard/policies', label: 'Policies \u2192' },
  { n: 3, text: 'Create \u20B92,00,000 payout \u2014 chain previews live', to: '/dashboard/payments/new', label: 'New payment \u2192' },
  { n: 4, text: 'Approve step-by-step, reject needs reason', to: '/dashboard/approvals', label: 'Approvals \u2192' },
  { n: 5, text: 'Execute \u2192 webhook settles the payment', to: '/dashboard/payments/PAY-2041', label: 'Payment detail \u2192' },
  { n: 6, text: 'Duplicate webhook arrives \u2014 ignored, once-only ledger', to: '/dashboard/events', label: 'Events \u2192' },
  { n: 7, text: 'Recon flags \u20B9560 mismatch \u2014 resolve as fee', to: '/dashboard/recon', label: 'Recon workbench \u2192' },
  { n: 8, text: 'Export audit trail for the auditor', to: '/dashboard/ledger', label: 'Ledger \u2192' },
];
