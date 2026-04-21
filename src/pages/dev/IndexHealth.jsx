// src/pages/dev/IndexHealth.jsx — Phase 2: PostgreSQL Index Health
import { useEffect, useState, useCallback } from 'react';
import { devAPI } from '../../services/dev.service';

const C = {
  bg:'var(--dev-bg)', bgCard:'var(--dev-card-bg)', border:'var(--dev-card-border)',
  brand:'#3b61f5', text:'var(--dev-text-primary)', textSec:'var(--dev-text-secondary)', textMuted:'var(--dev-text-muted)',
  success:'#10b981', warning:'#f59e0b', danger:'#ef4444',
  mono:"'JetBrains Mono',monospace",
};

const MOCK = {
  summary: { total_indexes:42, unused_indexes:3, tables_needing_index:2, total_index_size:'8.2 MB' },
  unused_indexes: [
    { table:'transactions_transaction', index:'transactions_status_idx',         size:'1.2 MB' },
    { table:'users_kycreviewlog',       index:'kyc_created_at_idx',               size:'640 kB' },
    { table:'cards_cardrequest',        index:'cards_request_pending_idx',        size:'320 kB' },
  ],
  tables_needing_index: [
    { table:'enquiry_userrequest', seq_scans:1847, idx_scans:12, index_usage_pct:0.6 },
    { table:'users_kycreviewlog',  seq_scans:943,  idx_scans:28, index_usage_pct:2.9 },
  ],
  by_table: {
    users_user:               { total_indexes:6, index_size:'2.1 MB', seq_scans:14,   idx_scans:1204 },
    cards_creditcard:         { total_indexes:4, index_size:'1.4 MB', seq_scans:8,    idx_scans:834  },
    transactions_transaction: { total_indexes:5, index_size:'2.8 MB', seq_scans:23,   idx_scans:445  },
    enquiry_userrequest:      { total_indexes:3, index_size:'0.9 MB', seq_scans:1847, idx_scans:12   },
  },
};

function Spinner() {
  return <span style={{ display:'inline-block', width:14, height:14, border:`2px solid rgba(59,97,245,0.2)`, borderTop:`2px solid ${C.brand}`, borderRadius:'50%', animation:'spin 0.65s linear infinite' }} />;
}

const MiniBar = ({ pct, color }) => (
  <div style={{ height:4, borderRadius:2, background:'var(--dev-card-border)', overflow:'hidden', width:'100%', marginTop:3 }}>
    <div style={{ width:`${Math.min(100,pct)}%`, height:'100%', background:color, borderRadius:2, transition:'width 800ms cubic-bezier(0.16,1,0.3,1)' }} />
  </div>
);

export default function IndexHealth() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMock, setIsMock]   = useState(false);
  const [tab, setTab]         = useState('overview');
  const [copyMsg, setCopyMsg] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await devAPI.getIndexHealth();
      setData(res);
      setIsMock(false);
    } catch {
      setData(MOCK);
      setIsMock(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const copyDrop = (idx) => {
    navigator.clipboard.writeText(`DROP INDEX ${idx.index};`).then(() => {
      setCopyMsg(m => ({ ...m, [idx.index]: true }));
      setTimeout(() => setCopyMsg(m => ({ ...m, [idx.index]: false })), 1800);
    });
  };

  const TABS = [
    { id:'overview', label:'Overview' },
    { id:'unused',   label:`Unused (${data?.summary?.unused_indexes ?? 0})` },
    { id:'needing',  label:`Needs Index (${data?.summary?.tables_needing_index ?? 0})` },
    { id:'by_table', label:'By Table' },
  ];

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`@keyframes spin { to { transform:rotate(360deg) } }`}</style>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:40, height:40, borderRadius:10, background:'rgba(249,115,22,0.12)', border:'1px solid rgba(249,115,22,0.25)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
          </div>
          <div>
            <h2 style={{ fontSize:22, fontWeight:800, color:C.text, fontFamily:"'Sora',sans-serif", letterSpacing:'-0.02em', margin:'0 0 3px' }}>Index Health</h2>
            <p style={{ fontSize:12, color:C.textSec, margin:0 }}>
              PostgreSQL index usage · Unused indexes · Sequential scan alerts · <code style={{ background:'var(--dev-card-border)', padding:'1px 5px', borderRadius:3, fontSize:11 }}>GET /api/dev/indexes/</code>
            </p>
          </div>
        </div>
        <button onClick={load} disabled={loading} style={{ display:'flex', alignItems:'center', gap:7, padding:'8px 16px', borderRadius:9, background:C.bgCard, border:`1px solid ${C.border}`, color:C.textSec, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
          {loading ? <Spinner /> : '↻'} Refresh
        </button>
      </div>

      {loading && !data ? (
        <div style={{ padding:64, textAlign:'center', color:C.textSec }}><Spinner /> <span style={{ marginLeft:10, fontSize:13 }}>Analysing indexes…</span></div>
      ) : data && (
        <>
          {/* KPI row */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
            {[
              { label:'Total Indexes',     value:data.summary.total_indexes,          color:C.brand                                              },
              { label:'Total Index Size',  value:data.summary.total_index_size,        color:C.text                                               },
              { label:'Unused Indexes',    value:data.summary.unused_indexes,          color:data.summary.unused_indexes > 0 ? C.warning : C.success, alert:data.summary.unused_indexes > 0 },
              { label:'Tables Need Index', value:data.summary.tables_needing_index,    color:data.summary.tables_needing_index > 0 ? C.danger : C.success, alert:data.summary.tables_needing_index > 0 },
            ].map(({ label, value, color, alert }) => (
              <div key={label} style={{ padding:'16px 18px', borderRadius:12, background: alert ? `${color}08` : C.bgCard, border:`1px solid ${alert ? `${color}30` : C.border}` }}>
                <div style={{ fontSize:22, fontWeight:800, color, fontFamily:"'Sora',sans-serif", letterSpacing:'-0.02em' }}>{value}</div>
                <div style={{ fontSize:10, color:C.textMuted, marginTop:4, textTransform:'uppercase', letterSpacing:'0.07em', fontWeight:700 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Tab bar */}
          <div style={{ display:'flex', gap:4, marginBottom:16, padding:4, background:'var(--dev-card-bg)', borderRadius:10, border:`1px solid ${C.border}`, width:'fit-content' }}>
            {TABS.map(({ id, label }) => (
              <button key={id} onClick={() => setTab(id)} style={{ padding:'6px 14px', borderRadius:7, border:'none', cursor:'pointer', background: tab===id ? 'rgba(59,97,245,0.18)' : 'transparent', color: tab===id ? '#8ba7ff' : C.textSec, fontSize:11, fontWeight:700, fontFamily:"'DM Sans',sans-serif", transition:'all 150ms' }}>
                {label}
              </button>
            ))}
          </div>

          {/* Overview */}
          {tab === 'overview' && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <div style={{ background:C.bgCard, border:`1px solid ${data.summary.unused_indexes > 0 ? 'rgba(245,158,11,0.3)' : C.border}`, borderRadius:14, padding:20 }}>
                <div style={{ fontSize:12, fontWeight:700, color:C.textMuted, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:14 }}>⚠ Unused Indexes — Safe to DROP</div>
                {data.summary.unused_indexes === 0 ? (
                  <div style={{ fontSize:13, color:C.success }}>✓ No unused indexes found — great!</div>
                ) : (
                  <div style={{ fontSize:13, color:C.textSec }}>
                    {data.summary.unused_indexes} index{data.summary.unused_indexes > 1 ? 'es' : ''} with 0 scans wasting disk space. Switch to "Unused" tab to see DROP statements.
                  </div>
                )}
              </div>
              <div style={{ background:C.bgCard, border:`1px solid ${data.summary.tables_needing_index > 0 ? 'rgba(239,68,68,0.3)' : C.border}`, borderRadius:14, padding:20 }}>
                <div style={{ fontSize:12, fontWeight:700, color:C.textMuted, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:14 }}>🔍 High Sequential Scans</div>
                {data.summary.tables_needing_index === 0 ? (
                  <div style={{ fontSize:13, color:C.success }}>✓ All tables have good index usage</div>
                ) : (
                  <div style={{ fontSize:13, color:C.textSec }}>
                    {data.summary.tables_needing_index} table{data.summary.tables_needing_index > 1 ? 's' : ''} with high sequential scans. Consider adding indexes on frequently queried columns.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Unused Indexes */}
          {tab === 'unused' && (
            <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:14, overflow:'hidden' }}>
              {data.unused_indexes.length === 0 ? (
                <div style={{ padding:48, textAlign:'center', color:C.success, fontSize:14 }}>✓ No unused indexes — database is clean!</div>
              ) : (
                <>
                  <div style={{ padding:'12px 18px', borderBottom:`1px solid ${C.border}`, fontSize:11, color:C.textMuted }}>
                    These indexes have 0 scans and are not primary keys or unique constraints. They waste disk space and slow INSERT/UPDATE.
                  </div>
                  {data.unused_indexes.map((idx, i) => (
                    <div key={idx.index} style={{ padding:'14px 18px', borderBottom: i < data.unused_indexes.length-1 ? `1px solid var(--dev-divider)` : 'none', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
                      <div style={{ minWidth:0 }}>
                        <div style={{ fontSize:12, fontFamily:C.mono, color:C.warning, marginBottom:4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          {idx.index}
                        </div>
                        <div style={{ fontSize:11, color:C.textMuted }}>
                          Table: <span style={{ color:C.textSec }}>{idx.table}</span> · Size: <span style={{ color:C.textSec }}>{idx.size}</span>
                        </div>
                        <div style={{ fontSize:11, fontFamily:C.mono, color:'rgba(239,68,68,0.7)', marginTop:6 }}>
                          DROP INDEX {idx.index};
                        </div>
                      </div>
                      <button onClick={() => copyDrop(idx)} style={{ flexShrink:0, padding:'5px 12px', borderRadius:7, background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.25)', color:'#fbbf24', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                        {copyMsg[idx.index] ? '✓ Copied' : '📋 Copy DROP'}
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {/* Tables needing index */}
          {tab === 'needing' && (
            <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:14, overflow:'hidden' }}>
              {data.tables_needing_index.length === 0 ? (
                <div style={{ padding:48, textAlign:'center', color:C.success, fontSize:14 }}>✓ All tables have good index coverage!</div>
              ) : (
                data.tables_needing_index.map((t, i) => {
                  const idxPct = Math.min(100, t.index_usage_pct);
                  return (
                    <div key={t.table} style={{ padding:'16px 20px', borderBottom: i < data.tables_needing_index.length-1 ? `1px solid var(--dev-divider)` : 'none' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                        <div>
                          <div style={{ fontSize:13, fontWeight:700, color:C.text, fontFamily:C.mono }}>{t.table}</div>
                          <div style={{ fontSize:11, color:C.textMuted, marginTop:3 }}>
                            Seq scans: <span style={{ color:C.danger, fontWeight:700 }}>{t.seq_scans.toLocaleString()}</span> · Index scans: <span style={{ color:C.textSec }}>{t.idx_scans}</span>
                          </div>
                        </div>
                        <span style={{ fontSize:12, fontWeight:700, color: idxPct < 10 ? C.danger : C.warning, background: idxPct < 10 ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)', padding:'3px 9px', borderRadius:20 }}>
                          {idxPct.toFixed(1)}% indexed
                        </span>
                      </div>
                      <MiniBar pct={idxPct} color={idxPct < 10 ? C.danger : C.warning} />
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* By table */}
          {tab === 'by_table' && (
            <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:14, overflow:'hidden' }}>
              <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr', padding:'10px 18px', borderBottom:`1px solid ${C.border}` }}>
                {['Table','Indexes','Size','Seq Scans','Idx Scans'].map(h => (
                  <span key={h} style={{ fontSize:10, fontWeight:700, color:C.textMuted, textTransform:'uppercase', letterSpacing:'0.08em' }}>{h}</span>
                ))}
              </div>
              {Object.entries(data.by_table || {}).map(([table, info], i, arr) => {
                const totalScans = (info.seq_scans || 0) + (info.idx_scans || 0);
                const idxRatio   = totalScans > 0 ? (info.idx_scans / totalScans * 100) : 100;
                const isAlert    = info.seq_scans > 500 && idxRatio < 50;
                return (
                  <div key={table} style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr', padding:'12px 18px', borderBottom: i < arr.length-1 ? `1px solid var(--dev-divider)` : 'none', alignItems:'center', background: isAlert ? 'rgba(239,68,68,0.03)' : 'transparent' }}>
                    <span style={{ fontSize:12, fontFamily:C.mono, color: isAlert ? C.danger : C.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{table}</span>
                    <span style={{ fontSize:12, fontFamily:C.mono, color:C.textSec }}>{info.total_indexes}</span>
                    <span style={{ fontSize:12, fontFamily:C.mono, color:C.textSec }}>{info.index_size}</span>
                    <span style={{ fontSize:12, fontFamily:C.mono, color: info.seq_scans > 500 ? C.warning : C.textSec }}>{info.seq_scans?.toLocaleString()}</span>
                    <span style={{ fontSize:12, fontFamily:C.mono, color:C.success }}>{info.idx_scans?.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {isMock && (
        <div style={{ marginTop:16, padding:'10px 16px', borderRadius:9, background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)', fontSize:11, color:'#fbbf24' }}>
          ⚠ Showing mock data — connect <code style={{ background:'rgba(0,0,0,0.2)', padding:'1px 5px', borderRadius:3 }}>GET /api/dev/indexes/</code> to see live index health
        </div>
      )}
    </div>
  );
}
