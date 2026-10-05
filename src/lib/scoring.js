import { pointsFor } from './constants.js';

/*
 * A lobby looks like:
 *   { name, players: ['A','B',...], games: [ { A: 1, B: 4, ... }, ... ] }
 * Each game maps player -> finishing position (1-8). Missing = no points.
 */

const compareRows = (a, b) =>
  b.points - a.points || b.wins - a.wins || b.top4 - a.top4 || a.last - b.last;

const sameRank = (a, b) => !!b && compareRows(a, b) === 0;

/**
 * Ranked rows for one lobby.
 * Tiebreak order: points, 1sts, top-4 finishes, latest game placement.
 * `carried` = optional { player: points } added on top (open-round points).
 */
export function standings(lobby, carried) {
  const rows = lobby.players.map((player) => {
    const base = carried?.[player] ?? 0;
    const row = { player, points: base, carried: base, wins: 0, top4: 0, last: 9 };
    for (const game of lobby.games) {
      const position = game[player];
      if (!position) continue;
      row.points += pointsFor(position);
      if (position === 1) row.wins++;
      if (position <= 4) row.top4++;
      row.last = position;
    }
    return row;
  });
  rows.sort(compareRows);
  rows.forEach((row, i) => {
    row.tied = sameRank(row, rows[i - 1]) || sameRank(row, rows[i + 1]);
  });
  return rows;
}
