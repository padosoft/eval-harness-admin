import type { ApiErrorState } from './api';
import type { ApiSchemaMeta } from './api';

export interface ErrorPayload {
  kind: ApiErrorState['kind'];
  status?: number;
  message: string;
}

export interface MetricTable {
  [name: string]: number;
}

export interface ReportDetailPayload extends ApiSchemaMeta {
  id: string;
  dataset: string;
  metrics?: MetricTable;
  schema_version?: string;
  schema?: string | null;
  sample_count?: number;
  failures_count?: number;
  finished_at?: string;
  raw_json?: Record<string, unknown> | null;
  metric_labels?: Record<string, string> | null;
  failures?: { category: string; count: number }[];
}

export interface CohortRow {
  cohort: string;
  pass_rate: number;
  samples: number;
}

export interface CohortsPayload extends ApiSchemaMeta {
  id: string;
  cohorts: CohortRow[];
}

export interface HistogramBucket {
  min: number;
  max: number;
  count: number;
}

export interface HistogramsPayload extends ApiSchemaMeta {
  id: string;
  buckets: HistogramBucket[];
}

export interface DiffMetric {
  metric: string;
  delta: number;
  status: 'improved' | 'regressed' | 'stable';
}

export interface DiffPayload extends ApiSchemaMeta {
  from: string;
  to: string;
  metrics: DiffMetric[];
  cohorts?: { cohort: string; status: 'improved' | 'regressed' | 'stable'; delta: number }[];
}

/**
 * Blocks added to `eval-harness.report.v1` in v1.6.
 *
 * The contract is additive, so an older report simply has none of these — which
 * is why every field here is optional and every consumer degrades to "this run
 * did not record it" rather than to a zero. A report from before repeated
 * sampling did not measure a resolution of 0; it measured nothing, and showing
 * `0.0%` would be a number somebody could act on that nobody produced.
 */
export interface ReportPrecision {
  scope?: string;
  repetitions?: number;
  resolution?: number;
  target_delta?: number;
  target_resolvable?: boolean;
  required_repetitions?: number;
  within_row_variance?: number;
  summary?: string;
  run?: {
    observations?: number;
    resolution?: number;
    target_resolvable?: boolean;
  };
}

export interface PassRateInterval {
  low?: number;
  high?: number;
  confidence?: number;
}

export interface SampleAggregateRow {
  id: string;
  row_hash?: string;
  repetitions?: number;
  passed?: number;
  errored?: number;
  pass_rate?: number;
  pass_rate_ci?: PassRateInterval;
  unstable?: boolean;
  score_mean?: number | null;
  score_stddev?: number | null;
  metrics?: Record<string, { mean?: number; stddev?: number; min?: number; max?: number; observations?: number }>;
}

export interface TrajectoryToolCall {
  name?: string;
  arguments?: Record<string, unknown>;
  result?: string | null;
  error?: string | null;
}

export interface SampleExecution {
  id: string;
  row_hash?: string;
  repetition?: number;
  tags?: string[];
  adversarial?: { category?: string; severity?: string; compliance_frameworks?: string[] } | null;
  actual_output?: string;
  scores?: Record<string, { score?: number; details?: Record<string, unknown> }>;
  trajectory?: {
    tool_calls?: TrajectoryToolCall[];
    steps?: number | null;
    finish_reason?: string | null;
    pending_approvals?: number;
    approvals?: string[];
  };
}

export interface ModelCostRow {
  model: string;
  calls?: number;
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
  cost_usd?: number;
  priced?: boolean;
}

export interface ReportCost {
  total_usd?: number;
  reported_usd?: number;
  derived_usd?: number;
  complete?: boolean;
  calls?: number;
  unpriced_calls?: number;
  unpriced_models?: string[];
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
  models?: ModelCostRow[];
}

export interface ReportBudget {
  limit_usd?: number | null;
  spent_usd?: number;
  halted?: boolean;
  completed_rows?: number;
  reason?: string | null;
}
