import { LOBBY_SIZE } from '../lib/constants.js';
import { shuffle } from '../lib/utils.js';
import {
  createLobbyTournament, currentRound, isFinalRound, makeLobbies,
  nextRoundPlayers, openStandings,
} from '../lib/lobbies.js';
import { createKnockout, scoreGame } from '../lib/knockout.js';

/*
 * State is null (nothing running) or a lobby / knockout tournament object.
 * Pattern: clone state, mutate the clone in a helper, return the clone.
 */
export function reducer(state, action) {
  switch (action.type) {
    case 'RESET':
      return null;
    case 'START_LOBBY':
      return createLobbyTournament(action.config);
    case 'START_KNOCKOUT':
      return { type: 'knockout', ko: createKnockout(action.config) };
  }
  if (!state) return state;

  const next = structuredClone(state);
  switch (action.type) {
    case 'SET_POSITION':    setPosition(next, action); break;
    case 'NEXT_OPEN_ROUND': nextOpenRound(next); break;
    case 'MORE_OPEN_ROUND': next.open.total++; addOpenRound(next); next.stage = 'open'; break;
    case 'SET_DECISION':    Object.assign(next.decision, action.patch); break;
    case 'START_MAIN':      startMain(next); break;
    case 'ADVANCE_ROUND':   advanceRound(next); break;
    case 'KO_SCORE':        scoreGame(next.ko, action.where, action.side, action.delta); break;
    default: return state;
  }
  return next;
}

function setPosition(t, { lobbyIndex, gameIndex, player, position }) {
  const game = currentRound(t).lobbies[lobbyIndex].games[gameIndex];
  if (position) game[player] = position;
  else delete game[player]; // blank option
}

function addOpenRound(t) {
  t.open.rounds.push({ lobbies: makeLobbies(shuffle(t.players), t.open.gamesPerRound) });
}

function nextOpenRound(t) {
  if (t.open.rounds.length < t.open.total) addOpenRound(t);
  else t.stage = 'decide';
}

function startMain(t) {
  const rows = openStandings(t.open.rounds);
  const { cut, keep, carryPoints } = t.decision;
  const maxKeep = Math.floor(rows.length / LOBBY_SIZE);
  const doCut = cut && maxKeep >= 1;
  const size = doCut ? Math.min(keep, maxKeep) * LOBBY_SIZE : rows.length;

  t.openTotals = Object.fromEntries(rows.map((r) => [r.player, r.points]));
  t.carried = carryPoints ? t.openTotals : null;
  t.rounds = [{ lobbies: makeLobbies(rows.slice(0, size).map((r) => r.player), t.gamesPerRound) }];
  t.stage = 'main';
}

function advanceRound(t) {
  const round = t.rounds.at(-1);
  if (isFinalRound(round)) {
    t.finished = true;
    return;
  }
  const players = nextRoundPlayers(round, t.carried, t.advancePerLobby);
  t.rounds.push({ lobbies: makeLobbies(players, t.gamesPerRound) });
}
