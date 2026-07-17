// src/features/dashboard/DashboardSidebar.jsx
// Finance-ops sidebar: Overview, Payments, Approvals, Reconciliation, Webhooks, Reports
import React from 'react';
import {
  LayoutDashboard, CreditCard, CheckSquare, GitMerge,
  Zap, FileBarChart, User, Settings, LogOut, Bell,
  ArrowLeftRight, Clock, AlertTriangle, CheckCircle2,
  RefreshCw, AlertOctagon, FileText, BarChart3, History,
  ShieldAlert, List, Inbox, RotateCcw,
} from 'lucide-react';
import useThemeStore from '../../store/themeStore';
import useAuthStore from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

// ── Finance-ops sidebar map ────────────────────────────────────────────────────
export const SIDEBAR_MAP = {
  overview: {
    title: 'Overview',
    items: [
      { id: 'kpi-strip',        label: 'Live KPIs',            icon: LayoutDashboard },
      { id: 'payment-feed',     label: 'Payment Feed',         icon: ArrowLeftRight  },
      { id: 'gateway-health',   label: 'Gateway Health',       icon: ShieldAlert     },
      { id: 'pending-approvals',label: 'Pending Approvals',    icon: Clock, badge: 7 },
      { id: 'notifications',    label: 'Notifications',        icon: Bell,  badge: 3 },
    ],
  },
  payments: {
    title: 'Payments',
    items: [
      { id: 'all-payments',  label: 'All Payments',     icon: ArrowLeftRight },
      { id: 'pending-pay',   label: 'Pending',          icon: Clock          },
      { id: 'failed-pay',    label: 'Failed',           icon: AlertOctagon   },
      { id: 'refunds',       label: 'Refunds',          icon: RotateCcw      },
      { id: 'pay-history',   label: 'History',          icon: History        },
    ],
  },
  approvals: {
    title: 'Approvals',
    items: [
      { id: 'approval-queue',   label: 'Queue',               icon: Inbox,         badge: 7 },
      { id: 'approval-history', label: 'History',             icon: History                 },
      { id: 'approval-rules',   label: 'Threshold Rules',     icon: List                    },
      { id: 'escalations',      label: 'Escalations',         icon: AlertTriangle           },
    ],
  },
  reconciliation: {
    title: 'Reconciliation',
    items: [
      { id: 'recon-latest',   label: 'Latest Run',        icon: RefreshCw      },
      { id: 'recon-mismatch', label: 'Mismatches',        icon: AlertOctagon   },
      { id: 'recon-history',  label: 'Run History',       icon: History        },
      { id: 'dispute-log',    label: 'Dispute Log',       icon: FileText       },
    ],
  },
  webhooks: {
    title: 'Webhooks',
    items: [
      { id: 'event-log',    label: 'Event Log',          icon: List           },
      { id: 'duplicates',   label: 'Duplicates Dropped', icon: CheckCircle2   },
      { id: 'dlq',          label: 'Dead-Letter Queue',  icon: AlertOctagon   },
      { id: 'endpoints',    label: 'Endpoints',          icon: Zap            },
    ],
  },
  reports: {
    title: 'Reports',
    items: [
      { id: 'settlement-report', label: 'Settlement',       icon: FileBarChart   },
      { id: 'approval-report',   label: 'Approval Summary', icon: CheckSquare    },
      { id: 'recon-report',      label: 'Recon Summary',    icon: GitMerge       },
      { id: 'audit-log',         label: 'Audit Log',        icon: BarChart3      },
    ],
  },
  profile: {
    title: 'Profile',
    items: [
      { id: 'personal',  label: 'Personal Info',     icon: User     },
      { id: 'security',  label: 'Security',          icon: Settings },
      { id: 'logout',    label: 'Logout',            icon: LogOut, danger: true },
    ],
  },
};

const DashboardSidebar = ({ activeSection, activeItem, onItemClick }) => {
  const { theme }  = useThemeStore();
  const { logout } = useAuthStore();
  const navigate   = useNavigate();
  const isDark     = theme === 'dark';

  const section = SIDEBAR_MAP[activeSection] || SIDEBAR_MAP.overview;

  const handleClick = (item) => {
    if (item.danger) { logout(); navigate('/login'); return; }
    onItemClick?.(item.id);
  };

  return (
    <nav style={{
      width:       220,
      minHeight:   '100%',
      background:  'var(--dash-sidebar-bg, rgba(7,9,15,0.96))',
      borderRight: '1px solid var(--dash-border, rgba(59,97,245,0.08))',
      display:     'flex',
      flexDirection:'column',
      padding:     '20px 0',
      flexShrink:  0,
    }}>
      <div style={{ padding:'0 18px', marginBottom:20 }}>
        <p style={{ fontSize:10, fontWeight:700, color:'#3b61f5', letterSpacing:'0.1em', fontFamily:"'Sora',sans-serif" }}>
          {section.title.toUpperCase()}
        </p>
      </div>

      <div style={{ flex:1, display:'flex', flexDirection:'column', gap:2, padding:'0 8px' }}>
        {section.items.map((item) => {
          const Icon   = item.icon;
          const active = activeItem === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleClick(item)}
              style={{
                display:      'flex',
                alignItems:   'center',
                gap:          10,
                padding:      '9px 12px',
                borderRadius: 10,
                border:       'none',
                background:   active ? 'var(--dash-link-active-bg, rgba(59,97,245,0.1))' : 'transparent',
                color:        item.danger ? '#ef4444' : active ? 'var(--dash-link-active, #3b61f5)' : 'var(--dash-link-inactive, rgba(255,255,255,0.5))',
                cursor:       'pointer',
                fontFamily:   "'DM Sans','Sora',sans-serif",
                fontSize:     13,
                fontWeight:   active ? 600 : 400,
                textAlign:    'left',
                transition:   'all 0.15s ease',
                width:        '100%',
                borderLeft:   active ? '2px solid #3b61f5' : '2px solid transparent',
              }}
              onMouseEnter={e => {
                if (!active && !item.danger) {
                  e.currentTarget.style.background = 'rgba(59,97,245,0.05)';
                  e.currentTarget.style.color = 'var(--text-primary, #fff)';
                }
              }}
              onMouseLeave={e => {
                if (!active && !item.danger) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--dash-link-inactive, rgba(255,255,255,0.5))';
                }
              }}
            >
              <Icon size={15} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span style={{
                  fontSize: 9, fontWeight: 800,
                  background: item.id === 'escalations' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                  color:      item.id === 'escalations' ? '#ef4444' : '#f59e0b',
                  padding: '2px 7px', borderRadius: 5,
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default DashboardSidebar;
