import React from 'react';

export class RouteErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          fontFamily: 'system-ui, sans-serif',
        }}>
          <div style={{ maxWidth: 420, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
            <h1 style={{ fontSize: 22, marginBottom: 12 }}>Something went wrong</h1>
            <p style={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.5, marginBottom: 24 }}>
              This screen hit an error. Try going back to the dashboard or refresh the page.
            </p>
            <button
              type="button"
              onClick={() => {
                window.history.replaceState({ page: 'dashboard' }, '', window.location.pathname);
                window.location.reload();
              }}
              style={{
                background: '#FF6B35',
                color: 'white',
                border: 'none',
                padding: '14px 28px',
                borderRadius: 24,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Reload to dashboard
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
