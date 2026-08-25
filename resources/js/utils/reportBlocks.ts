import type {
  ReportBudget,
  ReportCost,
  ReportPrecision,
  SampleAggregateRow,
  SampleExecution,
} from '@/types/models';

/**
 * Readers for the report blocks added in eval-harness v1.6.
 *
 * They all take the report's `raw_json` because that is where the payload
 * already is: the detail endpoint returns the whole artifact, and the v1.6 keys
 * are additive to a contract this UI already receives in full. Adding API
 * endpoints for data the client is holding would be work that buys nothing.
 *
 * Every reader returns `null`/`[]` for a report that predates the feature, and
 * every caller renders "this run did not record it" rather than a zero. A run
 * from before repeated sampling did not measure a resolution of 0 — it measured
 * nothing, and `0.0%` is a number somebody could act on that nobody produced.
 */
const block = (raw: Record<string, unknown> | null | undefined, key: string): Record<string, unknown> | null => {
  const value = raw?.[key];

  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
};

const list = (raw: Record<string, unknown> | null | undefined, key: string): Record<string, unknown>[] => {
  const value = raw?.[key];

  return Array.isArray(value) ? (value.filter((item) => item && typeof item === 'object') as Record<string, unknown>[]) : [];
};

export const readPrecision = (raw: Record<string, unknown> | null | undefined): ReportPrecision | null =>
  block(raw, 'precision') as ReportPrecision | null;

export const readCost = (raw: Record<string, unknown> | null | undefined): ReportCost | null =>
  block(raw, 'cost') as ReportCost | null;

export const readBudget = (raw: Record<string, unknown> | null | undefined): ReportBudget | null =>
  block(raw, 'budget') as ReportBudget | null;

export const readSampleAggregates = (raw: Record<string, unknown> | null | undefined): SampleAggregateRow[] =>
  list(raw, 'sample_aggregates') as unknown as SampleAggregateRow[];

export const readSamples = (raw: Record<string, unknown> | null | undefined): SampleExecution[] =>
  list(raw, 'samples') as unknown as SampleExecution[];

/**
 * Rows that did not pass every execution, worst first.
 *
 * The same ordering the CLI briefing uses, for the same reason: when a list is
 * truncated by a screen rather than by a budget, the rows that survive should
 * be the ones the pipeline handled worst.
 */
export const failingAggregates = (rows: SampleAggregateRow[]): SampleAggregateRow[] =>
  rows
    .filter((row) => (row.pass_rate ?? 1) < 1 || (row.errored ?? 0) > 0)
    .sort((left, right) => (left.score_mean ?? -1) - (right.score_mean ?? -1));

/**
 * Rows that disagree with themselves across repetitions.
 *
 * These are the rows that fail builds nobody broke, and they are worth their
 * own list: a flapping row is a different problem from a failing one, and the
 * fix is usually a dataset fix rather than a pipeline fix.
 */
export const unstableAggregates = (rows: SampleAggregateRow[]): SampleAggregateRow[] =>
  rows.filter((row) => row.unstable === true);

/**
 * The worst-scoring execution of a row, which is the one worth showing.
 */
export const worstExecutionOf = (samples: SampleExecution[], sampleId: string): SampleExecution | null => {
  const candidates = samples.filter((sample) => sample.id === sampleId);

  if (candidates.length === 0) {
    return null;
  }

  // An execution with no scores at all is an *errored* one, and it is the most
  // interesting thing that can have happened to a row. Ranking it as the best
  // candidate (positive infinity) hid it behind a sibling execution that
  // happened to score — showing a successful answer on a row the reader opened
  // precisely because it failed.
  const meanScore = (sample: SampleExecution): number => {
    const scores = Object.values(sample.scores ?? {})
      .map((entry) => entry?.score)
      .filter((score): score is number => typeof score === 'number');

    return scores.length === 0 ? Number.NEGATIVE_INFINITY : scores.reduce((a, b) => a + b, 0) / scores.length;
  };

  return candidates.reduce((worst, sample) => (meanScore(sample) < meanScore(worst) ? sample : worst));
};

export const shortHash = (hash: string | undefined): string => (hash ? hash.slice(0, 12) : '—');
