/**
 * AuroraBackground - soft, slowly-drifting blurred color blobs.
 * Terracotta family, dark-theme friendly, GPU-friendly (transform/opacity only).
 * Styles live in src/index.css (.aurora-blob*) so they're not trapped in <style jsx>.
 * prefers-reduced-motion: blobs render static (no drift) via the CSS media query.
 */
const AuroraBackground = ({ className = '' }) => (
  <div
    className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    aria-hidden="true"
  >
    <div className="aurora-blob aurora-blob-1" />
    <div className="aurora-blob aurora-blob-2" />
    <div className="aurora-blob aurora-blob-3" />
  </div>
);

export default AuroraBackground;
