import { useRef } from 'react';
import { useConnectors } from '../hooks/useConnectors.js';
import { isLocked, podium, roundLabel } from '../lib/knockout.js';
import MatchCard from './MatchCard.jsx';

export default function KnockoutView({ ko, dispatch }) {
  const ref = useRef(null);
  const total = ko.rounds.length;
  const result = podium(ko);

  // Match i in round r feeds match floor(i/2) in round r+1.
  const links = ko.rounds.slice(0, -1).flatMap((round, r) =>
    round.map((_, i) => [`${r}-${i}`, `${r + 1}-${i >> 1}`])
  );
  const { width, height, paths } = useConnectors(ref, links, 'elbow');

  const score = (where) => (side, delta) => dispatch({ type: 'KO_SCORE', where, side, delta });

  return (
    <>
      {result && (
        <div className="champ">
          🏆 Champion: {result.first}
          <div className="mute" style={{ fontWeight: 400 }}>
            2nd: {result.second}{result.third && ` · 3rd: ${result.third}`}
          </div>
        </div>
      )}

      <h2>Knockout bracket</h2>
      <div className="bracket-scroll">
        <div className="bracket knockout" ref={ref}>
          <svg className="connectors" width={width} height={height}>
            {paths.map((d, i) => <path key={i} d={d} />)}
          </svg>
          {ko.rounds.map((round, r) => (
            <div className="col" key={r}>
              <h3>{roundLabel(r, total)}</h3>
              {/* Final column: grid keeps the final centred, third place sits right below it. */}
              <div className={r === total - 1 ? 'final-group' : 'matches'}>
                {r === total - 1 && <div />}
                {round.map((match, i) => {
                  const where = { round: r, index: i };
                  return (
                    <MatchCard
                      key={i}
                      match={match}
                      nodeKey={`${r}-${i}`}
                      label={`Match ${i + 1}`}
                      locked={isLocked(ko, where)}
                      onScore={score(where)}
                    />
                  );
                })}
                {r === total - 1 && (
                  <div className="third-slot">
                    {ko.third && (
                      <MatchCard match={ko.third} label="Third place" locked={false} onScore={score({ third: true })} />
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {ko.thirdImpossible && <p className="mute">No third-place match possible (too few players).</p>}
    </>
  );
}
