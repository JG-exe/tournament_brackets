import { advancerCount } from '../lib/lobbies.js';
import { pointsFor } from '../lib/constants.js';
import { standings } from '../lib/scoring.js';
import { ordinal } from '../lib/utils.js';

/**
 * Placement entry for every lobby in a round.
 * Rows stay in fixed player order (so dropdowns do not jump); rank is shown in a column.
 * onPosition(lobbyIndex, gameIndex, player, position)  position 0 = cleared
 */
export default function RoundEditor({ round, carried, perLobby, isMain, onPosition }) {
  return (
    <>
      {round.lobbies.map((lobby, lobbyIndex) => (
        <LobbyTable
          key={lobby.name}
          lobby={lobby}
          carried={carried}
          advancing={isMain ? advancerCount(lobby, round, perLobby) : 0}
          warnTies={isMain}
          onPosition={(...args) => onPosition(lobbyIndex, ...args)}
        />
      ))}
    </>
  );
}

function LobbyTable({ lobby, carried, advancing, warnTies, onPosition }) {
  const rows = standings(lobby, carried);
  const byPlayer = Object.fromEntries(rows.map((row, i) => [row.player, { ...row, rank: i + 1 }]));

  return (
    <div className="card" style={{ marginBottom: 10 }}>
      <b>{lobby.name}</b>{' '}
      <span className="mute">
        {lobby.players.length} players{advancing > 0 && ` · top ${advancing} advance`}
      </span>
      <div className="tw">
        <table>
          <thead>
            <tr>
              <th>Player</th>
              {lobby.games.map((_, g) => <th key={g}>Game {g + 1}</th>)}
              {carried && <th>Open</th>}
              <th>Pts</th>
              <th>Rank</th>
            </tr>
          </thead>
          <tbody>
            {lobby.players.map((player) => {
              const row = byPlayer[player];
              return (
                <tr key={player}>
                  <td>{player}</td>
                  {lobby.games.map((game, g) => (
                    <td key={g}>
                      <PositionSelect
                        game={game}
                        player={player}
                        onChange={(position) => onPosition(g, player, position)}
                      />
                    </td>
                  ))}
                  {carried && <td className="n">{row.carried}</td>}
                  <td className="n"><b>{row.points}</b></td>
                  <td className="n">{row.rank}{row.rank <= advancing && ' ✔'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {warnTies && rows.some((r) => r.tied) && (
        <div className="warn">
          Tied on points, wins, top-4s and last game. Resolve manually (edit a placement) before advancing.
        </div>
      )}
    </div>
  );
}

/** Dropdown 1st..8th. A position already used by another player in this game is disabled. */
function PositionSelect({ game, player, onChange }) {
  const taken = new Set(Object.entries(game).filter(([p]) => p !== player).map(([, pos]) => pos));
  return (
    <select value={game[player] ?? ''} onChange={(e) => onChange(Number(e.target.value))}>
      <option value="">–</option>
      {Array.from({ length: 8 }, (_, i) => i + 1).map((pos) => (
        <option key={pos} value={pos} disabled={taken.has(pos)}>
          {ordinal(pos)} ({pointsFor(pos)})
        </option>
      ))}
    </select>
  );
}
