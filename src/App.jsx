import ConfirmButton from './components/ConfirmButton.jsx';
import DecisionStage from './components/DecisionStage.jsx';
import KnockoutView from './components/KnockoutView.jsx';
import MainStage from './components/MainStage.jsx';
import OpenStage from './components/OpenStage.jsx';
import Setup from './components/Setup.jsx';
import { STORAGE_KEY } from './lib/constants.js';
import { usePersistedReducer } from './hooks/usePersistedReducer.js';
import { reducer } from './state/reducer.js';

/** Picks the screen from state. All state changes go through dispatch (see state/reducer.js). */
function Screen({ state, dispatch }) {
  if (!state) return <Setup dispatch={dispatch} />;
  if (state.type === 'knockout') return <KnockoutView ko={state.ko} dispatch={dispatch} />;
  if (state.stage === 'open') return <OpenStage t={state} dispatch={dispatch} />;
  if (state.stage === 'decide') return <DecisionStage t={state} dispatch={dispatch} />;
  return <MainStage t={state} dispatch={dispatch} />;
}

export default function App() {
  const [state, dispatch] = usePersistedReducer(reducer, STORAGE_KEY);

  return (
    <main>
      <h1>TFT Tournament Bracket</h1>
      <p className="mute">
        Lobby mode: points per game = 9 − placement (1st = 8, 8th = 1). Lobbies up to 8 players. One placement per game.
      </p>
      <Screen state={state} dispatch={dispatch} />
      {state && (
        <div className="row">
          <ConfirmButton className="sec" confirmLabel="Sure? Click again to wipe" onConfirm={() => dispatch({ type: 'RESET' })}>
            Reset
          </ConfirmButton>
        </div>
      )}
    </main>
  );
}
