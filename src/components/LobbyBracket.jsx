import { useRef } from 'react';
import { useConnectors } from '../hooks/useConnectors.js';
import { advancerCount, isFinalRound, projectRounds } from '../lib/lobbies.js';
import { standings } from '../lib/scoring.js';

/**
 * Columns of rounds with a line per player from round N to round N+1
 * (advancers are re-seeded, so lines follow players, not lobbies).
 * Dashed ghost columns = rounds still to come.
 */
export default function LobbyBracket({ rounds, carried, perLobby, finished }) {
  const ref = useRef(null);

  // A link exists for every player who appears in both round r and r+1.
  const links = rounds.slice(0, -1).flatMap((round, r) =>
    round.lobbies.flatMap((lobby) =>
      lobby.players
        .filter((p) => rounds[r + 1].lobbies.some((next) => next.players.includes(p)))
        .map((p) => [`${r}|${p}`, `${r + 1}|${p}`])
    )
  );
  const { width, height, paths } = useConnectors(ref, links, 'curve');
  const upcoming = projectRounds(rounds.at(-1), perLobby);

  return (
    <>
      <div className="bracket-scroll">
        <div className="bracket" ref={ref}>
          <svg className="connectors" width={width} height={height}>
            {paths.map((d, i) => <path key={i} d={d} />)}
          </svg>

          {rounds.map((round, r) => (
            <div className="col" key={r}>
              <h3>{isFinalRound(round) ? 'Final' : `Round ${r + 1}`}</h3>
              {round.lobbies.map((lobby) => {
                const advancing = advancerCount(lobby, round, perLobby);
                return (
                  <div className="card lob" key={lobby.name}>
                    <b>{lobby.name}</b>
                    <ol>
                      {standings(lobby, carried).map((row, i) => {
                        const champion = finished && isFinalRound(round) && i === 0;
                        return (
                          <li
                            key={row.player}
                            data-node={`${r}|${row.player}`}
                            className={champion ? 'champ1' : i < advancing ? 'adv' : ''}
                          >
                            <span>{i + 1}. {row.player}</span>
                            <span>{row.points}</span>
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                );
              })}
            </div>
          ))}

          {upcoming.map((sizes, i) => (
            <div className="col" key={`future-${i}`}>
              <h3>{sizes.length === 1 ? 'Final' : `Round ${rounds.length + 1 + i}`}</h3>
              {sizes.map((size, j) => (
                <div className="card lob ghost" key={j}>
                  <b>Lobby {j + 1}</b>
                  <ol>
                    {Array.from({ length: size }, (_, k) => <li key={k} className="tbd"><span>TBD</span></li>)}
                  </ol>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <p className="mute">
        Green = advancing (provisional in current round). Lines follow each player between rounds. Dashed = rounds still to come.
      </p>
    </>
  );
}
