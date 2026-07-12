import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuthContext } from '../context/AuthContext';

const navSections = [
  {
    title: 'MAIN',
    items: [
      { to: '/',            label: 'Dashboard',    icon: '▦',  end: true },
      { to: '/checkin',     label: 'Daily Check-in', icon: '☀️' },
      { to: '/insights',   label: 'Insights',     icon: '📊' },
      { to: '/achievements', label: 'Achievements', icon: '🏆' },
      { to: '/ai',         label: 'AI Assistant', icon: '🤖' },
    ],
  },
  {
    title: 'TRACKERS',
    items: [
      { to: '/sleep',      label: 'Sleep',        icon: '◑' },
      { to: '/nutrition',  label: 'Nutrition',    icon: '◈' },
      { to: '/activity',   label: 'Activity',     icon: '◎' },
      { to: '/symptoms',   label: 'Symptoms',     icon: '◇' },
      { to: '/mood',       label: 'Mood',         icon: '◉' },
      { to: '/skin',       label: 'Skin',         icon: '✦' },
    ],
  },
  {
    title: 'OTHER',
    items: [
      { to: '/tools',      label: 'Tools',        icon: '⚙' },
    ],
  },
];

const pageTitles = {
  '/':             'Dashboard',
  '/checkin':      'Daily Check-in',
  '/sleep':        'Sleep Tracker',
  '/nutrition':    'Nutrition Log',
  '/activity':     'Activity Tracker',
  '/symptoms':     'Symptom Checker',
  '/mood':         'Mood & Wellness',
  '/skin':         'Skin Tracker',
  '/tools':        'Wellness Tools',
  '/insights':     'Insights & Reports',
  '/achievements': 'Achievements',
  '/ai':           'AI Health Assistant',
  '/profile':      'My Profile',
};

const notifications = [
  { id: 1, text: "Complete your morning check-in!",         time: 'Now',    icon: '☀️', unread: true  },
  { id: 2, text: "You've logged mood 3 days in a row! 🔥", time: '5h ago', icon: '🏆', unread: true  },
  { id: 3, text: "Try the AI Assistant for health tips",    time: '1d ago', icon: '🤖', unread: false },
  { id: 4, text: "New: Insights & Correlation Engine live", time: '1d ago', icon: '📊', unread: false },
];

export default function Layout() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, logout } = useAuthContext();
  const [collapsed,   setCollapsed]   = useState(false);
  const [notifOpen,   setNotifOpen]   = useState(false);
  const [notifsSeen,  setNotifsSeen]  = useState(false);

  const unreadCount = notifsSeen ? 0 : notifications.filter(n => n.unread).length;
  const pageTitle   = pageTitles[location.pathname] || 'HealthTrack';
  const initials    = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'HT';

  function handleLogout() { logout(); navigate('/login'); }
  function openNotifs()   { setNotifOpen(v => !v); setNotifsSeen(true); }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }} className="bg-mesh">

      {/* ── Sidebar ──────────────────────────────────────────────────────────── */}
      <aside style={{
        width: collapsed ? '72px' : '240px',
        transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
        background: 'linear-gradient(180deg, #0d1117 0%, #080b14 100%)',
        borderRight: '1px solid rgba(255,255,255,0.04)',
        display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh',
        flexShrink: 0, overflow: 'hidden',
      }}>

        {/* Logo */}
        <div style={{ padding: collapsed ? '18px 16px' : '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', gap: '10px' }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '15px', flexShrink: 0 }}>H</div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '15px', background: 'linear-gradient(135deg, #818cf8, #67e8f9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', whiteSpace: 'nowrap' }}>HealthTrack</div>
                <div style={{ fontSize: '10px', color: 'var(--color-muted)', whiteSpace: 'nowrap' }}>Wellness System</div>
              </div>
            </div>
          )}
          {collapsed && (
            <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '15px' }}>H</div>
          )}
          <button onClick={() => setCollapsed(v => !v)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '7px', padding: '5px 7px', cursor: 'pointer', color: 'var(--color-muted)', fontSize: '11px', flexShrink: 0, lineHeight: 1 }}>
            {collapsed ? '›' : '‹'}
          </button>
        </div>

        {/* Nav sections */}
        <nav style={{ flex: 1, padding: '10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navSections.map(section => (
            <div key={section.title}>
              {/* Section title */}
              {!collapsed && (
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-muted)', letterSpacing: '0.08em', padding: '10px 10px 4px', opacity: 0.6 }}>
                  {section.title}
                </div>
              )}
              {collapsed && <div style={{ height: '8px' }} />}

              {section.items.map(item => (
                <NavLink key={item.to} to={item.to} end={item.end}
                  title={collapsed ? item.label : undefined}
                  style={({ isActive }) => ({
                    display: 'flex', alignItems: 'center', gap: '11px',
                    padding: collapsed ? '10px 0' : '9px 12px',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    borderRadius: '10px', textDecoration: 'none',
                    fontSize: '13px', fontWeight: 500, transition: 'all 0.15s',
                    color: isActive ? '#c7d2fe' : 'var(--color-muted)',
                    background: isActive ? 'linear-gradient(135deg, rgba(99,102,241,0.18), rgba(6,182,212,0.08))' : 'transparent',
                    border: isActive ? '1px solid rgba(99,102,241,0.25)' : '1px solid transparent',
                    boxShadow: isActive ? 'inset 0 0 14px rgba(99,102,241,0.08)' : 'none',
                  })}>
                  <span style={{ fontSize: '16px', flexShrink: 0 }}>{item.icon}</span>
                  {!collapsed && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Profile + Logout */}
        <div style={{ padding: '10px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <NavLink to="/profile" title={collapsed ? 'Profile' : undefined}
            style={({ isActive }) => ({ display: 'flex', alignItems: 'center', gap: '10px', padding: collapsed ? '10px 0' : '10px 10px', justifyContent: collapsed ? 'center' : 'flex-start', borderRadius: '10px', textDecoration: 'none', marginBottom: '4px', background: isActive ? 'var(--color-surface-2)' : 'transparent', transition: 'background 0.15s' })}>
            <div style={{ width: '30px', height: '30px', borderRadius: '9px', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: 'white', flexShrink: 0 }}>{initials}</div>
            {!collapsed && (
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>{user?.name || 'User'}</div>
                <div style={{ fontSize: '11px', color: 'var(--color-muted)' }}>View profile</div>
              </div>
            )}
          </NavLink>
          <button onClick={handleLogout} title={collapsed ? 'Logout' : undefined}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: collapsed ? '10px 0' : '10px 10px', justifyContent: collapsed ? 'center' : 'flex-start', background: 'transparent', border: 'none', cursor: 'pointer', color: '#f87171', fontSize: '13px', fontWeight: 500, borderRadius: '10px', transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <span style={{ fontSize: '16px', flexShrink: 0 }}>⎋</span>
            {!collapsed && 'Logout'}
          </button>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Topbar */}
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 28px', position: 'sticky', top: 0, zIndex: 40, background: 'rgba(8,11,20,0.85)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: 700, fontFamily: 'Space Grotesk', margin: 0 }}>{pageTitle}</h2>
            <p style={{ color: 'var(--color-muted)', fontSize: '11px', margin: 0, marginTop: '2px' }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

            {/* Check-in quick button */}
            <NavLink to="/checkin"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '10px', background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(6,182,212,0.1))', border: '1px solid rgba(99,102,241,0.3)', textDecoration: 'none', fontSize: '12px', fontWeight: 600, color: '#a5b4fc' }}>
              <span>☀️</span> Check-in
            </NavLink>

            {/* Notification bell */}
            <div style={{ position: 'relative' }}>
              <button onClick={openNotifs} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-surface-3)', borderRadius: '10px', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '16px', position: 'relative' }}>
                🔔
                {unreadCount > 0 && (
                  <span className="pulse-dot" style={{ position: 'absolute', top: '-3px', right: '-3px', background: '#ef4444', color: 'white', borderRadius: '99px', fontSize: '9px', fontWeight: 700, padding: '1px 5px', minWidth: '16px', textAlign: 'center', boxShadow: '0 0 8px rgba(239,68,68,0.5)' }}>{unreadCount}</span>
                )}
              </button>
              {notifOpen && (
                <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 10px)', background: 'var(--color-surface)', border: '1px solid var(--color-surface-3)', borderRadius: '16px', width: '310px', boxShadow: '0 16px 48px rgba(0,0,0,0.6)', zIndex: 60, overflow: 'hidden' }}>
                  <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--color-surface-3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '14px' }}>Notifications</span>
                    <span style={{ fontSize: '11px', color: 'var(--color-muted)' }}>Today</span>
                  </div>
                  {notifications.map(n => (
                    <div key={n.id} style={{ display: 'flex', gap: '12px', padding: '13px 18px', alignItems: 'flex-start', background: n.unread && !notifsSeen ? 'rgba(99,102,241,0.06)' : 'transparent', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <span style={{ fontSize: '18px', flexShrink: 0 }}>{n.icon}</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '13px', color: 'var(--color-text)', lineHeight: 1.4, margin: 0 }}>{n.text}</p>
                        <p style={{ fontSize: '11px', color: 'var(--color-muted)', marginTop: '3px', marginBottom: 0 }}>{n.time}</p>
                      </div>
                    </div>
                  ))}
                  <div style={{ padding: '10px 18px', textAlign: 'center' }}>
                    <button onClick={() => setNotifOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--color-primary-light)', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>Dismiss all</button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile chip */}
            <NavLink to="/profile"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', padding: '6px 12px 6px 8px', borderRadius: '10px', background: 'var(--color-surface)', border: '1px solid var(--color-surface-3)', transition: 'border-color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-surface-3)'}>
              <div style={{ width: '26px', height: '26px', borderRadius: '7px', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: 'white' }}>{initials}</div>
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text)' }}>{user?.name?.split(' ')[0] || 'User'}</span>
            </NavLink>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}
          onClick={() => notifOpen && setNotifOpen(false)}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
