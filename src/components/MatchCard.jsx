/**
 * One 1v1 match. `+` adds a game win, `−` undoes one.
 * onScore(side, delta)   side = 'a' | 'b'
 */
export default function MatchCard({ match, nodeKey, label, locked, onScore }) {
  const playable = !match.bye && match.a && match.b;
  const header = `${label} · ${match.bye ? 'bye' : `Bo${match.need * 2 - 1}`}`;

  const renderSide = (side) => {
    const name = match[side];
    if (match.bye && !name) {
      return <div className="pl"><span className="tbd">BYE</span></div>;
    }
    const wins = match.wins[side];
    const state = match.winner === name && name ? 'win' : match.winner && name ? 'lose' : '';
    return (
      <div className={`pl ${state}`}>
        <span>{name ?? <span className="tbd">TBD</span>}</span>
        {playable && (
          <span className="sc">
            <button className="mini sec" disabled={wins < 1 || locked} onClick={() => onScore(side, -1)}>−</button>
            <b>{wins}</b>
            <button className="mini" disabled={!!match.winner} onClick={() => onScore(side, +1)}>+</button>
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="card mt" data-node={nodeKey}>
      <div className="mh">{header}</div>
      {renderSide('a')}
      {renderSide('b')}
    </div>
  );
}
