import D20Chapter from './D20Chapter.jsx';
import './d20.css';

// /d20: the Evaluate chapter alone, with room above and below to test entering and leaving the pin.
export default function D20Standalone() {
  return (
    <main className="d20-standalone">
      <div className="d20-spacer">Scroll ↓</div>
      <D20Chapter />
      <div className="d20-spacer">End of chapter</div>
    </main>
  );
}
