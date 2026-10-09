/**
 * Open-round leaderboard.
 * cutSize: highlight top N rows (decision screen).
 * qualified: Set of players in the main tournament; others are greyed.
 */
export default function OpenStandings({ rows, roundCount, cutSize = 0, qualified = null }) {
  return (
    <div className="card tw">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Player</th>
            {Array.from({ length: roundCount }, (_, i) => <th key={i}>R{i + 1}</th>)}
            <th>Total</th>
            <th>1sts</th>
            <th>Top 4</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const cls = qualified ? (qualified.has(row.player) ? '' : 'out') : i < cutSize ? 'inrow' : '';
            return (
              <tr key={row.player} className={cls}>
                <td className="n">{i + 1}</td>
                <td>{row.player}</td>
                {Array.from({ length: roundCount }, (_, r) => (
                  <td key={r} className="n">{row.perRound[r] ?? '–'}</td>
                ))}
                <td className="n totals"><b>{row.points}</b></td>
                <td className="n">{row.wins}</td>
                <td className="n">{row.top4}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
