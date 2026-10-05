import { useState } from 'react';
import { isFinalRound, isRoundComplete, openStandings } from '../lib/lobbies.js';
import { standings } from '../lib/scoring.js';
import ConfirmButton from './ConfirmButton.jsx';
import LobbyBracket from './LobbyBracket.jsx';
import OpenStandings from './OpenStandings.jsx';
import RoundEditor from './RoundEditor.jsx';

export default function MainStage({ t, dispatch }) {
  const [tab, setTab] = useState('scores');
  const round = t.rounds.at(-1);
  const final = isFinalRound(round);
  const champion = t.finished ? standings(round.lobbies[0], t.carried)[0].player : null;
  const tabs = [['scores', 'Scores'], ['bracket', 'Bracket'], ...(t.open ? [['open', 'Open rounds']] : [])];

  return (
    <>
      {champion && <div className="champ">🏆 Champion: {champion}</div>}

      <div className="row">
        {tabs.map(([id, label]) => (
          <button key={id} className={tab === id ? '' : 'sec'} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      {tab === 'scores' && (
        <>
          <h2>{final ? 'Final' : `Round ${t.rounds.length}`} placements{t.finished && ' (locked)'}</h2>
          <div className={t.finished ? 'locked' : ''}>
            <RoundEditor
              round={round}
              carried={t.carried}
              perLobby={t.advancePerLobby}
              isMain
              onPosition={(lobbyIndex, gameIndex, player, position) =>
                dispatch({ type: 'SET_POSITION', lobbyIndex, gameIndex, player, position })}
            />
          </div>
          {!t.finished && (
            <div className="row">
              <ConfirmButton
                needsConfirm={!isRoundComplete(round)}
                confirmLabel="Missing placements = 0 pts. Click again to continue"
                onConfirm={() => dispatch({ type: 'ADVANCE_ROUND' })}
              >
                {final ? 'Finish tournament' : 'Advance to next round'}
              </ConfirmButton>
            </div>
          )}
        </>
      )}

      {tab === 'bracket' && (
        <>
          <h2>Bracket</h2>
          <LobbyBracket rounds={t.rounds} carried={t.carried} perLobby={t.advancePerLobby} finished={t.finished} />
        </>
      )}

      {tab === 'open' && (
        <>
          <h2>Open rounds results</h2>
          <p className="mute">
            Stored separately.{' '}
            {t.carried
              ? 'These points are carried into every main round ranking.'
              : 'Not counted in the main tournament.'}{' '}
            Greyed = did not qualify.
          </p>
          <OpenStandings
            rows={openStandings(t.open.rounds)}
            roundCount={t.open.rounds.length}
            qualified={new Set(t.rounds[0].lobbies.flatMap((l) => l.players))}
          />
        </>
      )}
    </>
  );
}
