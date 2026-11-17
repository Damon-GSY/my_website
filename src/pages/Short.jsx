// /short: the sixty-second version (assembly plan §3, "Short" mode). The static bento study, full window.
export default function Short() {
  return (
    <>
      <iframe
        src="/lab/bento/"
        title="Damon Guan, the short version"
        style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', border: 0, background: '#f4f4f2' }}
      />
      <a
        href="/"
        style={{
          position: 'fixed',
          right: 12,
          bottom: 12,
          zIndex: 2,
          padding: '8px 12px',
          borderRadius: 999,
          background: '#0d0d0d',
          color: '#f4f4f2',
          font: '600 11px/1 "Cartograph CF", ui-monospace, monospace',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}
      >
        ← Full site
      </a>
    </>
  );
}
