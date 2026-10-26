# TFT Tournament Bracket

A basic bracket tool for tournaments. Handles any reasonable number of players.  
Two modes: 8-player lobby (auto balances if not %8) tournament (optional open rounds first) and 1v1 knockout (auto handles byes).  
Written in Reactjs.

[live site](https://jg-exe.github.io/tournament_brackets/)

## Run

    paru -S nodejs npm        # if not installed
    npm install
    npm run dev               # dev server

## Layout

    src/lib/          logic
      constants.js    lobby size, points formula
      scoring.js      lobby standings + tiebreaks
      lobbies.js      lobby seeding, advancing, open rounds, projection
      knockout.js     1v1 bracket, byes, best-of, third place
      utils.js        shuffle, name parsing, small helpers
    src/state/reducer.js   state changes
    src/hooks/             localStorage persistence, bracket connector lines
    src/components/        UI only

State lives in one object (see createLobbyTournament / createKnockout).
Reducer clones state, mutates the clone, returns it.
