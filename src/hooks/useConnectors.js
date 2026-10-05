import { useEffect, useLayoutEffect, useRef, useState } from 'react';

/**
 * Draws lines between bracket nodes.
 * Mark elements with data-node="key". `links` = [[fromKey, toKey], ...].
 * shape: 'curve' (smooth) or 'elbow' (right angles).
 * Returns { width, height, paths } to render inside an <svg>.
 */
export function useConnectors(containerRef, links, shape) {
  const [svg, setSvg] = useState({ width: 0, height: 0, paths: [] });

  const measure = () => {
    const box = containerRef.current;
    if (!box) return;
    const origin = box.getBoundingClientRect();
    const nodes = new Map();
    box.querySelectorAll('[data-node]').forEach((el) => nodes.set(el.dataset.node, el));

    const paths = [];
    for (const [from, to] of links) {
      const a = nodes.get(from)?.getBoundingClientRect();
      const b = nodes.get(to)?.getBoundingClientRect();
      if (!a || !b) continue;
      const x1 = a.right - origin.left;
      const y1 = a.top + a.height / 2 - origin.top;
      const x2 = b.left - origin.left;
      const y2 = b.top + b.height / 2 - origin.top;
      const mid = (x1 + x2) / 2;
      paths.push(
        shape === 'elbow'
          ? `M${x1} ${y1}H${mid}V${y2}H${x2}`
          : `M${x1} ${y1}C${mid} ${y1} ${mid} ${y2} ${x2} ${y2}`
      );
    }
    const next = { width: box.scrollWidth, height: box.offsetHeight, paths };
    // Returning prev when equal stops an endless render loop.
    setSvg((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
  };

  const latest = useRef(measure);
  latest.current = measure;

  useLayoutEffect(() => measure()); // after every render

  useEffect(() => {
    const onResize = () => latest.current();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return svg;
}
