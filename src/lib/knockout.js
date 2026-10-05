import { shuffle } from './utils.js';

/*
 * Match: { a, b, bye, wins: {a, b}, winner, need }
 *   a/b     player names (null = not decided yet)
 *   need    game wins required = (bestOf + 1) / 2
 * Bracket: ko.rounds[r][i]. Winner of match i feeds round r+1, match floor(i/2),
 * so neighbours meet. ko.third = third-place match or null.
 * Functions below MUTATE ko. The reducer calls them on a clone.
 */

const newMatch = (a = null, b = null, bye = false) => ({
  a, b, bye, wins: { a: 0, b: 0 }, winner: null, need: 1,
});

export function createKnockout({ players, bo, boFinal, wantThird }) {
  const roundCount = Math.ceil(Math.log2(players.length));
  const size = 2 ** roundCount;
  const firstMatches = size / 2;
  const byes = size - players.length;
  const order = shuffle(players);

  // Spread byes evenly so no first-round match has two byes.
  const byeMatches = new Set(
    Array.from({ length: byes }, (_, i) => Math.floor((i * firstMatches) / byes))
  );
  let next = 0;
  const first = Array.from({ length: firstMatches }, (_, i) => {
    if (byeMatches.has(i)) return newMatch(order[next++], null, true);
    const a = order[next++];
    const b = order[next++];
    return newMatch(a, b);
  });
  const rounds = [first];
  for (let r = 1; r < roundCount; r++) {
    rounds.push(Array.from({ length: firstMatches >> r }, () => newMatch()));
  }

  // Third place needs two real semi-finals (3 players -> a semi is a bye).
  const thirdPossible = roundCount >= 2 && !(roundCount === 2 && byes > 0);
  const ko = {
    bo, boFinal, rounds,
    third: wantThird && thirdPossible ? newMatch() : null,
    thirdImpossible: wantThird && !thirdPossible,
  };
  syncKnockout(ko);
  return ko;
}

const decide = (m) => {
  if (m.bye) m.winner = m.a ?? null;
  else if (!m.a || !m.b) m.winner = null;
  else if (m.wins.a >= m.need) m.winner = m.a;
  else if (m.wins.b >= m.need) m.winner = m.b;
  else m.winner = null;
};

/** Recompute slots, winners and third place from current game wins. */
export function syncKnockout(ko) {
  const last = ko.rounds.length - 1;
  ko.rounds.forEach((round, r) =>
    round.forEach((m, i) => {
      if (r > 0) {
        m.a = ko.rounds[r - 1][2 * i].winner;
        m.b = ko.rounds[r - 1][2 * i + 1].winner;
      }
      m.need = ((r === last ? ko.boFinal : ko.bo) + 1) / 2;
      decide(m);
    })
  );
  if (ko.third) {
    const loser = (m) => (m.winner ? (m.winner === m.a ? m.b : m.a) : null);
    const semis = ko.rounds[last - 1];
    ko.third.a = loser(semis[0]);
    ko.third.b = loser(semis[1]);
    ko.third.need = (ko.bo + 1) / 2;
    decide(ko.third);
  }
}

/** where = { round, index } or { third: true } */
export const getMatch = (ko, where) =>
  where.third ? ko.third : ko.rounds[where.round][where.index];

/**
 * A decided match is locked once the match it feeds has games played.
 * Undo the later match first. Stops the bracket becoming inconsistent.
 */
export function isLocked(ko, where) {
  if (where.third) return false;
  const { round, index } = where;
  const last = ko.rounds.length - 1;
  if (!ko.rounds[round][index].winner) return false;
  if (round < last) {
    const fed = ko.rounds[round + 1][index >> 1];
    if (fed.wins.a + fed.wins.b > 0) return true;
  }
  return round === last - 1 && !!ko.third && ko.third.wins.a + ko.third.wins.b > 0;
}

/** side = 'a' | 'b', delta = +1 | -1 */
export function scoreGame(ko, where, side, delta) {
  const m = getMatch(ko, where);
  if (delta > 0) {
    if (m.winner || !m.a || !m.b) return;
    m.wins[side]++;
  } else {
    if (m.wins[side] < 1 || isLocked(ko, where)) return;
    m.wins[side]--;
  }
  syncKnockout(ko);
}

export function roundLabel(index, total) {
  if (index === total - 1) return 'Final';
  if (index === total - 2) return 'Semi-finals';
  if (index === total - 3) return 'Quarter-finals';
  return `Round of ${2 ** (total - index)}`;
}

export function podium(ko) {
  const final = ko.rounds.at(-1)[0];
  if (!final.winner) return null;
  return {
    first: final.winner,
    second: final.winner === final.a ? final.b : final.a,
    third: ko.third?.winner ?? null,
  };
}
