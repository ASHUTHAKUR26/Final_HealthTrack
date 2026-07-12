import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--color-bg)', textAlign: 'center', padding: '32px',
    }}>
      <div style={{ fontSize: '80px', marginBottom: '16px' }}>🏥</div>
      <h1 style={{ fontSize: '48px', fontWeight: 800, fontFamily: 'Space Grotesk', marginBottom: '8px' }}>
        <span style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>404</span>
      </h1>
      <p style={{ fontSize: '18px', color: 'var(--color-muted-light)', marginBottom: '8px' }}>Page not found</p>
      <p style={{ fontSize: '14px', color: 'var(--color-muted)', maxWidth: '300px', lineHeight: 1.6, marginBottom: '32px' }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" style={{
        padding: '12px 28px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
        color: 'white', textDecoration: 'none', fontWeight: 600, fontSize: '14px',
        boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
      }}>
        ← Back to Dashboard
      </Link>
    </div>
  );
}
