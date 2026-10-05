import { LOBBY_SIZE, pointsFor } from './constants.js';
import { shuffle } from './utils.js';
import { standings } from './scoring.js';

/* A round is { lobbies: [lobby, ...] }. One lobby in a round = the final. */

export const isFinalRound = (round) => round.lobbies.length === 1;

export const isRoundComplete = (round) =>
  round.lobbies.every((lobby) =>
    lobby.games.every((game) => lobby.players.every((p) => game[p]))
  );

/** Current round being edited: open stage or main stage. */
export const currentRound = (t) =>
  t.stage === 'open' ? t.open.rounds.at(-1) : t.rounds.at(-1);

/**
 * Split players (already in seed order) into balanced lobbies of <= 8.
 * Snake order: seed 1 -> lobby 1, seed 2 -> lobby 2 ... then reverse direction,
 * so strong players spread out.
 */
export function makeLobbies(players, gameCount) {
  const count = Math.ceil(players.length / LOBBY_SIZE);
  const lobbies = Array.from({ length: count }, (_, i) => ({
    name: `Lobby ${i + 1}`,
    players: [],
    games: Array.from({ length: gameCount }, () => ({})),
  }));
  players.forEach((player, i) => {
    const sweep = Math.floor(i / count);
    const col = i % count;
    lobbies[sweep % 2 === 0 ? col : count - 1 - col].players.push(player);
  });
  return lobbies;
}

/**
 * How many players a lobby sends on. Capped at size-1 so rounds always shrink.
 * Final round advances nobody.
 */
export function advancerCount(lobby, round, perLobby) {
  if (isFinalRound(round)) return 0;
  return Math.max(1, Math.min(perLobby, lobby.players.length - 1));
}

/** Advancers from every lobby, seeded: lobby winners first, then 2nd places... */
export function nextRoundPlayers(round, carried, perLobby) {
  const picked = [];
  for (const lobby of round.lobbies) {
    standings(lobby, carried)
      .slice(0, advancerCount(lobby, round, perLobby))
      .forEach((row, place) =>
        picked.push({ player: row.player, place, points: row.points })
      );
  }
  picked.sort((a, b) => a.place - b.place || b.points - a.points);
  return picked.map((p) => p.player);
}

/** Lobby sizes of rounds still to come, e.g. [[8,8],[8]]. Display only. */
export function projectRounds(round, perLobby) {
  if (isFinalRound(round)) return [];
  let remaining = round.lobbies.reduce(
    (sum, lobby) => sum + advancerCount(lobby, round, perLobby),
    0
  );
  const out = [];
  for (let i = 0; i < 10 && remaining > 0; i++) {
    const count = Math.ceil(remaining / LOBBY_SIZE);
    const base = Math.floor(remaining / count);
    const extra = remaining % count;
    const sizes = Array.from({ length: count }, (_, k) => base + (k < extra ? 1 : 0));
    out.push(sizes);
    if (count === 1) break;
    remaining = sizes.reduce(
      (sum, size) => sum + Math.max(1, Math.min(perLobby, size - 1)),
      0
    );
  }
  return out;
}

/** Combined leaderboard over all open rounds. Kept apart from main rounds. */
export function openStandings(openRounds) {
  const byPlayer = new Map();
  openRounds.forEach((round, r) =>
    round.lobbies.forEach((lobby) =>
      lobby.players.forEach((player) => {
        const row = byPlayer.get(player) ?? {
          player, points: 0, wins: 0, top4: 0, perRound: [],
        };
        let roundPoints = 0;
        for (const game of lobby.games) {
          const position = game[player];
          if (!position) continue;
          roundPoints += pointsFor(position);
          if (position === 1) row.wins++;
          if (position <= 4) row.top4++;
        }
        row.points += roundPoints;
        row.perRound[r] = roundPoints;
        byPlayer.set(player, row);
      })
    )
  );
  return [...byPlayer.values()].sort(
    (a, b) =>
      b.points - a.points || b.wins - a.wins || b.top4 - a.top4 ||
      a.player.localeCompare(b.player)
  );
}

/** True if players either side of the cut line are level on every tiebreak. */
export function cutIsTied(rows, cutSize) {
  const a = rows[cutSize - 1];
  const b = rows[cutSize];
  return !!a && !!b && a.points === b.points && a.wins === b.wins && a.top4 === b.top4;
}

export function createLobbyTournament(cfg) {
  const { players, gamesPerRound, advancePerLobby, openRounds, openGames, shuffleSeeding } = cfg;
  const hasOpen = openRounds > 0;
  return {
    type: 'lobby',
    players,
    gamesPerRound,
    advancePerLobby,
    stage: hasOpen ? 'open' : 'main', // 'open' -> 'decide' -> 'main'
    open: hasOpen
      ? {
          total: openRounds,
          gamesPerRound: openGames,
          rounds: [{ lobbies: makeLobbies(shuffle(players), openGames) }],
        }
      : null,
    decision: {
      cut: false, // cut field to full lobbies of 8?
      keep: Math.max(1, Math.floor(players.length / LOBBY_SIZE)), // lobbies kept
      carryPoints: false, // add open points into main ranking?
    },
    openTotals: null, // { player: openPoints }, always stored once main starts
    carried: null, // same map, but only when carrying; null = start clean
    rounds: hasOpen
      ? []
      : [{ lobbies: makeLobbies(shuffleSeeding ? shuffle(players) : players, gamesPerRound) }],
    finished: false,
  };
}
