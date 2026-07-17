// src/features/dashboard/Dashboard.jsx — Credify Finance Ops Dashboard
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import useThemeStore from '../../store/themeStore';
import DashboardNavbar from './DashboardNavbar';
import DashboardSidebar from './DashboardSidebar';
import {
  DashboardOverview, LivePaymentFeed, GatewayHealthPanel,
  ApprovalQueue, ApprovalHistory, ApprovalRules, EscalationsPanel,
  ReconLatest, ReconMismatches,
  WebhookEventLog, WebhookDuplicates, DeadLetterQueue,
  PersonalInfo, SecuritySettings, NotificationSettings, KYCStatus,
  // Legacy compat
  SpendingSummary, NotificationsPanel,
} from './SectionContent';

// ── Content registry: maps section + item → component ─────────────────────────
const CONTENT = {
  overview: {
    'kpi-strip':         DashboardOverview,
    'payment-feed':      LivePaymentFeed,
    'gateway-health':    GatewayHealthPanel,
    'pending-approvals': ApprovalQueue,
    'notifications':     NotificationsPanel,
  },
  payments: {
    'all-payments': LivePaymentFeed,
    'pending-pay':  LivePaymentFeed,
    'failed-pay':   LivePaymentFeed,
    'refunds':      LivePaymentFeed,
    'pay-history':  LivePaymentFeed,
  },
  approvals: {
    'approval-queue':    ApprovalQueue,
    'approval-history':  ApprovalHistory,
    'approval-rules':    ApprovalRules,
    'escalations':       EscalationsPanel,
  },
  reconciliation: {
    'recon-latest':   ReconLatest,
    'recon-mismatch': ReconMismatches,
    'recon-history':  ReconLatest,
    'dispute-log':    ReconMismatches,
  },
  webhooks: {
    'event-log':  WebhookEventLog,
    'duplicates': WebhookDuplicates,
    'dlq':        DeadLetterQueue,
    'endpoints':  WebhookEventLog,
  },
  reports: {
    'settlement-report': ReconLatest,
    'approval-report':   ApprovalHistory,
    'recon-report':      ReconLatest,
    'audit-log':         WebhookEventLog,
  },
  profile: {
    'personal':  PersonalInfo,
    'security':  SecuritySettings,
    'notif-settings': NotificationSettings,
  },
};

const DEFAULT_ITEM = {
  overview:       'kpi-strip',
  payments:       'all-payments',
  approvals:      'approval-queue',
  reconciliation: 'recon-latest',
  webhooks:       'event-log',
  reports:        'settlement-report',
  profile:        'personal',
};

const Dashboard = () => {
  const { theme }     = useThemeStore();
  const isDark        = theme === 'dark';
  const [section, setSection] = useState('overview');
  const [item,    setItem]    = useState('kpi-strip');

  const handleSectionChange = useCallback((s) => {
    setSection(s);
    setItem(DEFAULT_ITEM[s] || Object.keys(CONTENT[s] || {})[0]);
  }, []);

  const handleItemClick = useCallback((id) => setItem(id), []);

  const ContentComp = CONTENT[section]?.[item] || DashboardOverview;

  return (
    <div style={{
      display:    'flex',
      flexDirection: 'column',
      height:     '100vh',
      background: 'var(--bg-base)',
      fontFamily: "'DM Sans','Sora',sans-serif",
    }}>
      <DashboardNavbar
        activeSection={section}
        setActiveSection={handleSectionChange}
        onRefresh={() => window.location.reload()}
      />

      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>
        <DashboardSidebar
          activeSection={section}
          activeItem={item}
          onItemClick={handleItemClick}
        />

        {/* Main content */}
        <main style={{
          flex:       1,
          overflow:   'auto',
          padding:    '32px 36px',
          background: isDark ? 'var(--bg-base)' : 'var(--bg-base)',
        }}>
          <div style={{ maxWidth:1100 }}>
            <ContentComp />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
