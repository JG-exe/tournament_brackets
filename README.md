# TFT Tournament Bracket

Two modes: 8-player lobby tournament (optional open rounds first) and 1v1 knockout.

## Run
    paru -S nodejs npm        # if not installed
    npm install
    npm run dev               # dev server
    npm test                  # logic tests (no browser needed)

## Layout
    src/lib/          pure logic, no React. Edit rules here.
      constants.js    lobby size, points formula
      scoring.js      lobby standings + tiebreaks
      lobbies.js      lobby seeding, advancing, open rounds, projection
      knockout.js     1v1 bracket, byes, best-of, third place
      utils.js        shuffle, name parsing, small helpers
    src/state/reducer.js   every state change is one action here
    src/hooks/             localStorage persistence, bracket connector lines
    src/components/        UI only. Reads state, dispatches actions.

State lives in one object (see createLobbyTournament / createKnockout).
Reducer clones state, mutates the clone, returns it. Keep that pattern.
