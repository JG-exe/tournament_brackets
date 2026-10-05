import { useEffect, useState } from 'react';

/**
 * Two-click button. First click arms it (label changes), second click confirms.
 * Disarms after 4s. `needsConfirm={false}` makes it a normal one-click button.
 * (window.confirm() is avoided: it is blocked inside sandboxed iframes.)
 */
export default function ConfirmButton({ children, confirmLabel, needsConfirm = true, onConfirm, className = '' }) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const id = setTimeout(() => setArmed(false), 4000);
    return () => clearTimeout(id);
  }, [armed]);

  const click = () => {
    if (!needsConfirm || armed) {
      setArmed(false);
      onConfirm();
    } else {
      setArmed(true);
    }
  };

  return (
    <button className={`${className} ${armed ? 'armed' : ''}`.trim()} onClick={click}>
      {armed ? confirmLabel : children}
    </button>
  );
}
