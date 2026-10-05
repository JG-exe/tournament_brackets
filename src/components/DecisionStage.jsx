import { LOBBY_SIZE } from '../lib/constants.js';
import { cutIsTied, openStandings } from '../lib/lobbies.js';
import OpenStandings from './OpenStandings.jsx';

/** Shown after the last open round: choose how the main tournament starts. */
export default function DecisionStage({ t, dispatch }) {
  const rows = openStandings(t.open.rounds);
  const maxKeep = Math.floor(rows.length / LOBBY_SIZE); // full lobbies possible
  const cut = t.decision.cut && maxKeep >= 1;
  const keep = Math.min(t.decision.keep, Math.max(1, maxKeep));
  const cutSize = cut ? keep * LOBBY_SIZE : 0;
  const set = (patch) => dispatch({ type: 'SET_DECISION', patch });

  return (
    <>
      <h2>Open rounds finished</h2>
      <p className="mute">Open results are stored separately. Decide how the main tournament starts.</p>

      <div className="card" style={{ marginBottom: 10 }}>
        <b>Start main tournament</b>
        <div className="row" style={{ marginTop: 0 }}>
          <label>
            Field{' '}
            <select value={cut ? 'cut' : 'all'} onChange={(e) => set({ cut: e.target.value === 'cut' })}>
              <option value="all">All {rows.length} players (balanced lobbies)</option>
              <option value="cut" disabled={maxKeep < 1}>Cut to full lobbies of 8</option>
            </select>
          </label>

          {cut && (
            <label>
              Keep{' '}
              <select value={keep} onChange={(e) => set({ keep: Number(e.target.value) })}>
                {Array.from({ length: maxKeep }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>Top {n * LOBBY_SIZE} ({n} {n === 1 ? 'lobby' : 'lobbies'})</option>
                ))}
              </select>
            </label>
          )}

          <label>
            Points{' '}
            <select
              value={t.decision.carryPoints ? 'carry' : 'clean'}
              onChange={(e) => set({ carryPoints: e.target.value === 'carry' })}
            >
              <option value="clean">Start clean (open points kept separate)</option>
              <option value="carry">Carry open points on top</option>
            </select>
          </label>
        </div>

        {cut && cutIsTied(rows, cutSize) && (
          <div className="warn">
            Tie on the cut line: level on points, 1sts and top-4s. Order there is arbitrary.
            Change the cut or play another open round.
          </div>
        )}

        <div className="row">
          <button onClick={() => dispatch({ type: 'START_MAIN' })}>Start main tournament</button>
          <button className="sec" onClick={() => dispatch({ type: 'MORE_OPEN_ROUND' })}>Play another open round</button>
        </div>
      </div>

      <h2>Open standings</h2>
      <OpenStandings rows={rows} roundCount={t.open.rounds.length} cutSize={cutSize} />
    </>
  );
}
