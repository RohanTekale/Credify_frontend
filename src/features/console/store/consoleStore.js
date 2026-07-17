// src/features/console/store/consoleStore.js
// Real console state: vendors, payments, approval chains, events and ledger.
// Persisted per browser. The backend has no vendor/payment/ledger endpoints yet
// (only users/cards/transactions/requests) — when those APIs land, the actions
// below become API calls and the shape stays the same.
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ── Policy engine (single source of truth, mirrored by PoliciesPage) ─────────
export const POLICY_BANDS = [
  { band: 'Below ₹10,000', chain: [], version: 'v1' },
  { band: '₹10,000 – ₹1,00,000', chain: ['APPROVER'], version: 'v1' },
  { band: 'Above ₹1,00,000', chain: ['APPROVER', 'FINANCE', 'ADMIN'], version: 'v1' },
];

export const policyChain = (amount) => {
  const a = Number(amount) || 0;
  if (a < 10000) return [];
  if (a < 100000) return ['APPROVER'];
  return ['APPROVER', 'FINANCE', 'ADMIN'];
};

export const ROLE_CLASS = { APPROVER: 'r-app', FINANCE: 'r-fin', ADMIN: 'r-admin' };

// ── Formatting helpers ────────────────────────────────────────────────────────
export const fmtINR = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

export const clock = (iso) =>
  iso ? new Date(iso).toLocaleTimeString('en-IN', { hour12: false }) : '—';

export const dayTime = (iso) =>
  iso
    ? new Date(iso).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false,
      })
    : '—';

export const paymentStatusMeta = (p) => {
  switch (p.status) {
    case 'auto':
      return { label: 'Auto-approved', chip: 'c-blue' };
    case 'in_approval': {
      const done = p.chain.filter((s) => s.status === 'ok').length;
      return { label: `In approval · ${done}/${p.chain.length}`, chip: 'c-amber' };
    }
    case 'approved':
      return { label: 'Approved · ready', chip: 'c-green' };
    case 'rejected':
      return { label: 'Rejected', chip: 'c-grey' };
    case 'settled':
      return { label: 'Settled', chip: 'c-green' };
    default:
      return { label: p.status, chip: 'c-grey' };
  }
};

export const bandLabel = (amount) => {
  const a = Number(amount) || 0;
  if (a < 10000) return 'Below ₹10,000 · auto';
  if (a < 100000) return '₹10,000 – ₹1,00,000';
  return 'Above ₹1,00,000';
};

const now = () => new Date().toISOString();
const evtId = () => 'evt_' + Math.random().toString(36).slice(2, 8);

const BUILTIN_ROLES = [
  { role: 'ADMIN', roleClass: 'r-admin', type: 'Built-in', perms: 'Everything + manage roles, policies, integrations' },
  { role: 'FINANCE', roleClass: 'r-fin', type: 'Built-in', perms: 'Approve payments · run recon · resolve exceptions · export audit' },
  { role: 'APPROVER', roleClass: 'r-app', type: 'Built-in', perms: 'Approve payments in assigned bands' },
];

const useConsoleStore = create(
  persist(
    (set, get) => ({
      vendors: [],
      payments: [],
      events: [],
      ledger: [],
      roles: BUILTIN_ROLES,
      seq: 1001,

      addVendor: ({ name, account, ifsc }) => {
        const vendor = {
          id: Date.now(),
          name: name.trim(),
          account: account.trim(),
          ifsc: ifsc.trim().toUpperCase(),
          status: 'Pending verification',
          chip: 'c-amber',
          createdAt: now(),
        };
        set((s) => ({ vendors: [vendor, ...s.vendors] }));
        return vendor;
      },

      addRole: ({ name, perms }) => {
        set((s) => ({
          roles: [
            ...s.roles,
            { role: name.toUpperCase(), roleClass: 'r-custom', type: 'Custom', perms },
          ],
        }));
      },

      createPayment: ({ vendorName, amount, rail, purpose, createdBy }) => {
        const seq = get().seq;
        const ref = `PAY-${seq}`;
        const chain = policyChain(amount).map((role, i) => ({
          role,
          status: i === 0 ? 'pend' : 'wait',
          by: null,
          at: null,
          note: null,
        }));
        const payment = {
          ref,
          vendor: vendorName,
          amount: Number(amount),
          rail,
          purpose,
          createdBy,
          createdAt: now(),
          settledAt: null,
          status: chain.length ? 'in_approval' : 'auto',
          chain,
        };
        set((s) => ({ payments: [payment, ...s.payments], seq: seq + 1 }));
        return ref;
      },

      // Approve (ok=true) or reject (ok=false) the current pending step.
      decidePayment: (ref, ok, { by, note } = {}) =>
        set((s) => ({
          payments: s.payments.map((p) => {
            if (p.ref !== ref || p.status !== 'in_approval') return p;
            const idx = p.chain.findIndex((st) => st.status === 'pend');
            if (idx === -1) return p;
            const chain = p.chain.map((st, i) => {
              if (i === idx) return { ...st, status: ok ? 'ok' : 'rejected', by, at: now(), note: note || null };
              if (ok && i === idx + 1) return { ...st, status: 'pend' };
              return st;
            });
            const finished = ok && idx === p.chain.length - 1;
            return { ...p, chain, status: !ok ? 'rejected' : finished ? 'approved' : 'in_approval' };
          }),
        })),

      // Execute an approved/auto payment: settle it, record a gateway event
      // and an append-only ledger posting (sandbox — no gateway connected yet).
      executePayment: (ref) => {
        const p = get().payments.find((x) => x.ref === ref);
        if (!p || (p.status !== 'approved' && p.status !== 'auto')) return;
        const at = now();
        const id = evtId();
        set((s) => ({
          payments: s.payments.map((x) =>
            x.ref === ref ? { ...x, status: 'settled', settledAt: at } : x
          ),
          events: [
            { at, id, type: 'payout.processed', provider: 'Sandbox', payment: ref, status: 'Processed', chip: 'c-green' },
            { at, id: evtId(), type: 'payout.initiated', provider: 'Sandbox', payment: ref, status: 'Acknowledged', chip: 'c-blue' },
            ...s.events,
          ],
          ledger: [
            { at, entry: `Payout settled — ${p.vendor}`, payment: ref, debit: p.amount, credit: 0, source: id },
            ...s.ledger,
          ],
        }));
      },
    }),
    { name: 'credify-console' }
  )
);

export default useConsoleStore;
