import { currentRound, isRoundComplete, openStandings } from '../lib/lobbies.js';
import ConfirmButton from './ConfirmButton.jsx';
import OpenStandings from './OpenStandings.jsx';
import RoundEditor from './RoundEditor.jsx';

export default function OpenStage({ t, dispatch }) {
  const { open } = t;
  const round = currentRound(t);
  const isLast = open.rounds.length >= open.total;

  return (
    <>
      <h2>Open rounds: round {open.rounds.length} of {open.total}</h2>
      <p className="mute">Everyone plays every round. Lobbies reshuffled each round. Points = 9 − placement.</p>

      <RoundEditor
        round={round}
        isMain={false}
        onPosition={(lobbyIndex, gameIndex, player, position) =>
          dispatch({ type: 'SET_POSITION', lobbyIndex, gameIndex, player, position })}
      />

      <h2>Open standings</h2>
      <OpenStandings rows={openStandings(open.rounds)} roundCount={open.rounds.length} />

      <div className="row">
        <ConfirmButton
          needsConfirm={!isRoundComplete(round)}
          confirmLabel="Missing placements = 0 pts. Click again to continue"
          onConfirm={() => dispatch({ type: 'NEXT_OPEN_ROUND' })}
        >
          {isLast ? 'Finish open rounds' : 'Next open round'}
        </ConfirmButton>
      </div>
    </>
  );
}
