export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] selection:bg-[var(--primary)]/30">
      {children}
    </div>
  );
}
