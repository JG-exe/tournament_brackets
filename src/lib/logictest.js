// import test from 'node:test';
// import assert from 'node:assert/strict';
// import { standings } from './scoring.js';
// import { makeLobbies, openStandings, currentRound, projectRounds } from './lobbies.js';
// import { createKnockout, scoreGame, isLocked, podium } from './knockout.js';
// import { reducer } from '../state/reducer.js';
//
// const names = (n) => Array.from({ length: n }, (_, i) => `P${i}`);
//
// test('points = 9 - position, missing placement = 0', () => {
//   const lobby = { name: 'L', players: ['A', 'B', 'C'], games: [{ A: 1, B: 8 }] };
//   const rows = Object.fromEntries(standings(lobby).map((r) => [r.player, r.points]));
//   assert.deepEqual(rows, { A: 8, B: 1, C: 0 });
// });
//
// test('carried points are added on top', () => {
//   const lobby = { name: 'L', players: ['A', 'B'], games: [{ A: 2, B: 1 }] };
//   assert.equal(standings(lobby, { A: 10 })[0].player, 'A'); // 10 + 7 beats 8
// });
//
// test('lobbies are balanced and at most 8', () => {
//   const sizes = (n) => makeLobbies(names(n), 1).map((l) => l.players.length);
//   const spread = (n) => Math.max(...sizes(n)) - Math.min(...sizes(n));
//   assert.deepEqual(sizes(21), [7, 7, 7]);
//   assert.equal(sizes(17).reduce((a, b) => a + b), 17);
//   assert.ok(spread(17) <= 1 && Math.max(...sizes(17)) <= 8);
//   assert.deepEqual(sizes(8), [8]);
// });
//
// test('projection ends in a final', () => {
//   const round = { lobbies: makeLobbies(names(64), 1) };
//   const last = projectRounds(round, 4).at(-1);
//   assert.equal(last.length, 1);
// });
//
// test('knockout plays through for 2-17 players', () => {
//   for (let n = 2; n <= 17; n++) {
//     const ko = createKnockout({ players: names(n), bo: 1, boFinal: 3, wantThird: true });
//     for (let guard = 0; guard < 500; guard++) {
//       let where = null;
//       ko.rounds.forEach((round, r) =>
//         round.forEach((m, i) => { if (!where && !m.winner && m.a && m.b) where = { round: r, index: i }; })
//       );
//       if (!where && ko.third && !ko.third.winner && ko.third.a && ko.third.b) where = { third: true };
//       if (!where) break;
//       scoreGame(ko, where, 'a', 1);
//     }
//     const result = podium(ko);
//     assert.ok(result?.first, `champion for n=${n}`);
//     if (ko.third) assert.ok(result.third, `third for n=${n}`);
//   }
// });
//
// test('knockout: no two byes in one match, byes advance', () => {
//   const ko = createKnockout({ players: names(5), bo: 1, boFinal: 1, wantThird: false });
//   assert.ok(ko.rounds[0].every((m) => m.a));
//   assert.equal(ko.rounds[0].filter((m) => m.bye).length, 3);
// });
//
// test('knockout: undo locked once next match started', () => {
//   const ko = createKnockout({ players: names(4), bo: 1, boFinal: 3, wantThird: false });
//   scoreGame(ko, { round: 0, index: 0 }, 'a', 1);
//   scoreGame(ko, { round: 0, index: 1 }, 'a', 1);
//   scoreGame(ko, { round: 1, index: 0 }, 'a', 1);
//   assert.equal(isLocked(ko, { round: 0, index: 0 }), true);
//   scoreGame(ko, { round: 0, index: 0 }, 'a', -1);
//   assert.ok(ko.rounds[0][0].winner, 'undo ignored while locked');
// });
//
// function fill(t) {
//   const round = currentRound(t);
//   round.lobbies.forEach((l, li) =>
//     l.games.forEach((_, gi) =>
//       l.players.forEach((player, i) => {
//         t = reducer(t, { type: 'SET_POSITION', lobbyIndex: li, gameIndex: gi, player, position: i + 1 });
//       })
//     )
//   );
//   return t;
// }
//
// const base = { gamesPerRound: 3, advancePerLobby: 4, openGames: 1, shuffleSeeding: true };
//
// test('open rounds -> decision -> cut to 16 + carry points', () => {
//   let t = reducer(null, { type: 'START_LOBBY', config: { ...base, players: names(21), openRounds: 2 } });
//   assert.equal(t.stage, 'open');
//   t = reducer(fill(t), { type: 'NEXT_OPEN_ROUND' });
//   t = reducer(fill(t), { type: 'NEXT_OPEN_ROUND' });
//   assert.equal(t.stage, 'decide');
//   t = reducer(t, { type: 'SET_DECISION', patch: { cut: true, keep: 2, carryPoints: true } });
//   t = reducer(t, { type: 'START_MAIN' });
//   assert.equal(t.stage, 'main');
//   assert.deepEqual(t.rounds[0].lobbies.map((l) => l.players.length), [8, 8]);
//   assert.ok(t.carried && t.openTotals);
//   assert.equal(openStandings(t.open.rounds).length, 21, 'open results kept');
// });
//
// test('start clean keeps open totals separate', () => {
//   let t = reducer(null, { type: 'START_LOBBY', config: { ...base, players: names(10), openRounds: 1 } });
//   t = reducer(fill(t), { type: 'NEXT_OPEN_ROUND' });
//   t = reducer(t, { type: 'START_MAIN' });
//   assert.equal(t.carried, null);
//   assert.ok(t.openTotals);
//   assert.deepEqual(t.rounds[0].lobbies.map((l) => l.players.length), [5, 5]);
// });
//
// test('main rounds advance to a final and finish', () => {
//   let t = reducer(null, { type: 'START_LOBBY', config: { ...base, players: names(16), openRounds: 0 } });
//   t = reducer(fill(t), { type: 'ADVANCE_ROUND' });
//   assert.equal(t.rounds.length, 2);
//   assert.equal(t.rounds[1].lobbies.length, 1);
//   t = reducer(fill(t), { type: 'ADVANCE_ROUND' });
//   assert.equal(t.finished, true);
// });
