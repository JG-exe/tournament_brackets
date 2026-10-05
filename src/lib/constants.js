export const LOBBY_SIZE = 8;
export const MAX_OPEN_ROUNDS = 10;
export const STORAGE_KEY = 'tft-bracket-v2';

/** 1st place = 8 points ... 8th place = 1 point. */
export const pointsFor = (position) => 9 - position;
