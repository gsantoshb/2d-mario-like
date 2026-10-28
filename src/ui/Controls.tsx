export function Controls() {
  return (
    <div className="controls">
      <span>
        <kbd>A</kbd>
        <kbd>D</kbd> / <kbd>←</kbd>
        <kbd>→</kbd> Move
      </span>
      <span>
        <kbd>SPACE</kbd> Jump
      </span>
      <span>
        <kbd>X</kbd> Special power
      </span>
      <span>
        <kbd>ESC</kbd> Pause
      </span>
      <span className="keyboard-note">DESKTOP + KEYBOARD</span>
    </div>
  );
}
