import { useMemo } from 'react';
import type { OnlinePassRatePoint } from '@/types/api';

interface PassRateLineChartProps {
  points: OnlinePassRatePoint[];
  threshold: number;
  ariaLabel: string;
}

const WIDTH = 640;
const HEIGHT = 200;
const PADDING = 24;

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));

const formatPct = (value: number): string => `${(clamp01(value) * 100).toFixed(1)}%`;

/**
 * Dependency-free inline SVG pass-rate chart with a dashed threshold line.
 * Points below the threshold are marked red. A visually-hidden data table
 * mirrors the series so screen readers and Playwright have a stable
 * contract independent of the SVG geometry.
 */
const PassRateLineChart = ({ points, threshold, ariaLabel }: PassRateLineChartProps) => {
  const geometry = useMemo(() => {
    if (points.length === 0) {
      return { coords: [] as Array<{ x: number; y: number; below: boolean; point: OnlinePassRatePoint }>, thresholdY: 0 };
    }

    const innerW = WIDTH - PADDING * 2;
    const innerH = HEIGHT - PADDING * 2;
    const step = points.length > 1 ? innerW / (points.length - 1) : 0;
    const yFor = (rate: number): number => PADDING + (1 - clamp01(rate)) * innerH;

    const coords = points.map((point, index) => ({
      x: PADDING + (points.length > 1 ? step * index : innerW / 2),
      y: yFor(point.pass_rate),
      below: point.pass_rate < threshold,
      point,
    }));

    return { coords, thresholdY: yFor(threshold) };
  }, [points, threshold]);

  const summary = useMemo(() => {
    if (points.length === 0) {
      return '';
    }
    const rates = points.map((p) => p.pass_rate);
    const latest = rates[rates.length - 1];

    return `latest ${formatPct(latest)}, min ${formatPct(Math.min(...rates))}, max ${formatPct(Math.max(...rates))}`;
  }, [points]);

  const polyline = geometry.coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');

  return (
    <figure className="space-y-2" role="img" aria-label={`${ariaLabel} — ${summary}`}>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        width="100%"
        height={HEIGHT}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        className="rounded-ui border border-slate-100 bg-white"
      >
        <line
          x1={PADDING}
          x2={WIDTH - PADDING}
          y1={geometry.thresholdY}
          y2={geometry.thresholdY}
          stroke="#dc2626"
          strokeDasharray="4 4"
          strokeWidth={1}
        />
        {geometry.coords.length > 1 ? (
          <polyline points={polyline} fill="none" stroke="#0f172a" strokeWidth={2} />
        ) : null}
        {geometry.coords.map((c) => (
          <circle
            key={c.point.date}
            cx={c.x}
            cy={c.y}
            r={4}
            fill={c.below ? '#dc2626' : '#0f172a'}
          />
        ))}
      </svg>

      <figcaption className="sr-only">{`${ariaLabel} — ${summary}`}</figcaption>

      <table className="sr-only">
        <caption>{ariaLabel}</caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Pass rate</th>
            <th scope="col">Passed</th>
            <th scope="col">Total</th>
          </tr>
        </thead>
        <tbody>
          {points.map((point) => (
            <tr key={point.date}>
              <td>{point.date}</td>
              <td>{formatPct(point.pass_rate)}</td>
              <td>{point.passed}</td>
              <td>{point.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
};

export default PassRateLineChart;
