import { get } from 'es-toolkit/compat';
import { useContext, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import LayoutContext from '../../contexts/LayoutContext';
import { getCodebook } from '../../ducks/modules/protocol';

const viewBoxScale = 100;

const EdgeLayout = () => {
  const lines = useRef();
  const svg = useRef();
  const {
    network: { edges, links },
    getPosition,
  } = useContext(LayoutContext);
  const timer = useRef();
  const edgeDefinitions = useSelector((state) => getCodebook(state).edge);

  const update = useRef(() => {
    lines.current.forEach(({ link, el }) => {
      if (!link) {
        return;
      }

      const from = getPosition.current(link.source);
      const to = getPosition.current(link.target);

      if (!from || !to) {
        return;
      }

      el.setAttributeNS(null, 'x1', from.x * 100);
      el.setAttributeNS(null, 'y1', from.y * 100);
      el.setAttributeNS(null, 'x2', to.x * 100);
      el.setAttributeNS(null, 'y2', to.y * 100);
    });

    timer.current = requestAnimationFrame(() => update.current());
  });

  useEffect(() => {
    const currentSvg = svg.current;

    if (!currentSvg) {
      return () => cancelAnimationFrame(timer.current);
    }

    lines.current = edges.map((edge, index) => {
      const svgNS = currentSvg.namespaceURI;
      const el = document.createElementNS(svgNS, 'line');
      const color = get(
        edgeDefinitions,
        [edge.type, 'color'],
        'edge-color-seq-1',
      );
      el.setAttributeNS(null, 'stroke', `var(--nc-${color})`);
      return { edge, el, link: links[index] };
    });

    lines.current.forEach(({ el }) => currentSvg.appendChild(el));

    timer.current = requestAnimationFrame(() => update.current());

    return () => {
      lines.current.forEach(({ el }) => currentSvg.removeChild(el));
      cancelAnimationFrame(timer.current);
    };
  }, [edges, links, edgeDefinitions]);

  return (
    <div className="edge-layout">
      <svg
        viewBox={`0 0 ${viewBoxScale} ${viewBoxScale}`}
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        ref={svg}
      />
    </div>
  );
};

export default EdgeLayout;
