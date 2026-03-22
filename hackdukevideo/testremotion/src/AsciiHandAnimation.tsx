import React, {useMemo} from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

type Cell = {
  char: string;
  row: number;
  col: number;
  index: number;
};

const ASCII_HAND = `
F F F $ $ $ $
F $ $ $ $ $ $ $ F F F F
$ $ $ $ $ $ $      F   $
V V V V V V $ F     $   V
V V V V V $ $ $ $ $ V
* * * * * * * * * * *

                $ $
              $ $ $          $ $
              $ $ $          $ $
         V $ $ $ $ $ F   F $ $ V
        V * * $ F $ V   F F $ V V
        * * * $ F $ V V V V $
$ F      V $ $ $ $ F V F $ V V
F F F F   $ $ $ $ $ $ F F V V V
F F F F F F F F F $ F F F $ V V
$ $ $ F F F F F F F F F $ $ $
V V V V $ $ $ $ $ $ F $ $ $
V V V V V V V V V V V V V V $
V V * * * * * * * * * V
V V V V V V V V V V V V V
V * * * * * V V V V V
* * V V V
`;

const charBaseOpacity = (char: string): number => {
  switch (char) {
    case '*':
      return 0.95;
    case '$':
      return 0.82;
    case 'V':
      return 0.9;
    case 'F':
      return 0.35;
    default:
      return 0.75;
  }
};

const parseAscii = (source: string): Cell[] => {
  const rows = source
    .split('\n')
    .slice(1)
    .map((line) => line.replace(/\s+$/g, ''));

  const cells: Cell[] = [];
  let index = 0;

  rows.forEach((line, row) => {
    for (let col = 0; col < line.length; col++) {
      const char = line[col];
      if (char === ' ') {
        continue;
      }

      cells.push({char, row, col, index});
      index += 1;
    }
  });

  return cells;
};

export const AsciiHandAnimation: React.FC = () => {
  const frame = useCurrentFrame();
  const cells = useMemo(() => parseAscii(ASCII_HAND), []);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#ececec',
        fontFamily: 'Menlo, Monaco, Consolas, monospace',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 420,
          height: '100%',
          backgroundColor: 'rgba(255,255,255,0.2)',
          borderRight: '1px solid rgba(0,0,0,0.06)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: 418,
          top: 0,
          width: 3,
          height: 28,
          backgroundColor: '#ef4444',
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: 90,
          left: 95,
          color: '#8b8b8b',
          fontSize: 40,
          fontWeight: 600,
          letterSpacing: -1,
        }}
      >
        skale.solutions
      </div>

      <div
        style={{
          position: 'absolute',
          left: 22,
          bottom: 210,
          width: 690,
          height: 430,
          transform: `translateY(${Math.sin(frame * 0.04) * 2}px)`,
        }}
      >
        {cells.map((cell) => {
          const reveal = interpolate(frame - cell.index * 0.32, [0, 12], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

          const flicker = 0.8 + 0.2 * Math.sin(frame * 0.09 + cell.index * 0.55);
          const jitterX = Math.sin(frame * 0.06 + cell.index * 0.35) * 0.6;
          const jitterY = Math.cos(frame * 0.05 + cell.index * 0.21) * 0.6;
          const entryY = (1 - reveal) * 8;

          return (
            <span
              key={`${cell.row}-${cell.col}`}
              style={{
                position: 'absolute',
                left: cell.col * 16,
                top: cell.row * 18,
                color: '#171717',
                fontSize: 24,
                lineHeight: 1,
                fontWeight: 700,
                opacity: reveal * flicker * charBaseOpacity(cell.char),
                transform: `translate(${jitterX}px, ${jitterY + entryY}px)`,
                willChange: 'transform, opacity',
                userSelect: 'none',
              }}
            >
              {cell.char}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
