import { useState } from 'react';
import { MAX_OPEN_ROUNDS } from '../lib/constants.js';
import { clamp, parseNames } from '../lib/utils.js';

const DEFAULTS = {
  gamesPerRound: 3, advancePerLobby: 4, openRounds: 0, openGames: 1, shuffle: true,
  bo: 1, boFinal: 3, third: true,
};

export default function Setup({ dispatch }) {
  const [mode, setMode] = useState('lobby');
  const [names, setNames] = useState('');
  const [f, setF] = useState(DEFAULTS);
  const [error, setError] = useState('');

  // set('openRounds') -> onChange handler writing that field
  const set = (key) => (e) =>
    setF({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const submit = () => {
    const players = parseNames(names);
    if (players.length < 2) return setError('Need 2+ unique names.');

    if (mode === 'knockout') {
      const boFinal = Number(f.boFinal);
      if (!(boFinal >= 1 && boFinal % 2 === 1)) return setError('Final best-of must be an odd number.');
      dispatch({
        type: 'START_KNOCKOUT',
        config: { players, bo: Number(f.bo), boFinal, wantThird: f.third },
      });
    } else {
      dispatch({
        type: 'START_LOBBY',
        config: {
          players,
          gamesPerRound: clamp(f.gamesPerRound, 1, 10),
          advancePerLobby: clamp(f.advancePerLobby, 1, 7),
          openRounds: clamp(f.openRounds, 0, MAX_OPEN_ROUNDS),
          openGames: clamp(f.openGames, 1, 10),
          shuffleSeeding: f.shuffle,
        },
      });
    }
  };

  return (
    <>
      <h2>Setup</h2>
      <div className="card">
        <label>
          Mode{' '}
          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="lobby">Lobby (8-player)</option>
            <option value="knockout">1v1 knockout</option>
          </select>
        </label>
        <p className="mute">One player per line.</p>
        <textarea value={names} onChange={(e) => setNames(e.target.value)} placeholder={'Player 1\nPlayer 2\n...'} />

        {mode === 'lobby' ? (
          <div>
            <label>Games per round <input type="number" min="1" max="10" value={f.gamesPerRound} onChange={set('gamesPerRound')} /></label>
            <label>Advance per lobby <input type="number" min="1" max="7" value={f.advancePerLobby} onChange={set('advancePerLobby')} /></label>
            <label>Open rounds <input type="number" min="0" max={MAX_OPEN_ROUNDS} value={f.openRounds} onChange={set('openRounds')} /></label>
            <label>Games per open round <input type="number" min="1" max="10" value={f.openGames} onChange={set('openGames')} /></label>
            <label><input type="checkbox" checked={f.shuffle} onChange={set('shuffle')} /> Shuffle seeding</label>
          </div>
        ) : (
          <div>
            <label>
              Best of (rounds){' '}
              <select value={f.bo} onChange={set('bo')}>
                <option value="1">Bo1</option>
                <option value="3">Bo3</option>
              </select>
            </label>
            <label>Best of (final, odd) <input type="number" min="1" step="2" value={f.boFinal} onChange={set('boFinal')} /></label>
            <label><input type="checkbox" checked={f.third} onChange={set('third')} /> Third-place match</label>
          </div>
        )}

        <div className="row">
          <button onClick={submit}>Start tournament</button>
        </div>
        {error && <div className="warn">{error}</div>}
      </div>
    </>
  );
}
