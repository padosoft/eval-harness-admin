import type {
  AdversarialManifestDetail,
  AdversarialManifestSummary,
  ApiResult,
  LiveBatch,
  LiveBatchProgress,
  OnlineTrendPayload,
  ReportListPayload,
  TrendPayload,
} from '@/types/api';
import type { DiffPayload, ErrorPayload, ReportDetailPayload, CohortsPayload, HistogramsPayload } from '@/types/models';
import { buildUrl, normalizeBaseUrl } from '@/utils/path';

const ERROR_EMPTY_MESSAGE = 'Resource not available yet.';
const ERROR_INVALID_MESSAGE = 'Invalid request parameters.';
const ERROR_UNAVAILABLE_MESSAGE = 'Service temporarily unavailable.';
const ERROR_SCHEMA_MESSAGE = 'Invalid response payload.';
const ERROR_SCHEMA_MISSING_MESSAGE = 'Missing schema version in response.';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const schemaVersion = (value: Record<string, unknown>): string | null => {
  const version = value.schema_version;

  return typeof version === 'string' && version.trim() !== '' ? version.trim() : null;
};

const schemaValue = (value: Record<string, unknown>): string | null => {
  const schema = value.schema;

  return typeof schema === 'string' && schema.trim() !== '' ? schema.trim() : null;
};

const classifyStatusError = (status: number): ErrorPayload => {
  if (status === 404) {
    return {
      kind: 'empty',
      status,
      message: ERROR_EMPTY_MESSAGE,
    };
  }

  if (status === 422) {
    return {
      kind: 'invalid',
      status,
      message: ERROR_INVALID_MESSAGE,
    };
  }

  if (status === 503) {
    return {
      kind: 'unavailable',
      status,
      message: ERROR_UNAVAILABLE_MESSAGE,
    };
  }

  return {
    kind: 'error',
    status,
    message: `API returned ${status}`,
  };
};

const isValidSchema = (payload: unknown, expectedSchema?: string): ErrorPayload | null => {
  if (!isRecord(payload)) {
    return { kind: 'invalid', status: 200, message: ERROR_SCHEMA_MESSAGE };
  }

  const version = schemaVersion(payload);
  if (!version) {
    return { kind: 'invalid', status: 200, message: ERROR_SCHEMA_MISSING_MESSAGE };
  }

  const presentSchema = schemaValue(payload);
  if (expectedSchema && presentSchema && presentSchema !== expectedSchema) {
    return {
      kind: 'invalid',
      status: 200,
      message: `Unexpected schema '${presentSchema}', expected '${expectedSchema}'.`,
    };
  }

  void version;
  return null;
};

const asResult = <T>(payload: unknown, expectedSchema?: string, validateShape?: SchemaValidator): ApiResult<T> => {
  const schemaError = isValidSchema(payload, expectedSchema);
  if (schemaError) {
    return { error: schemaError };
  }

  if (!isRecord(payload) || (validateShape && !validateShape(payload))) {
    return { error: { kind: 'invalid', status: 200, message: ERROR_SCHEMA_MESSAGE } };
  }

  return { data: payload as T };
};

type SchemaValidator = (value: unknown) => boolean;

const onlineTrendBody = (value: unknown): Record<string, unknown> => {
  if (!isRecord(value)) {
    return {};
  }

  return isRecord(value.data) ? value.data : value;
};

const isValidOnlineTrend = (body: Record<string, unknown>): boolean => {
  if (typeof body.dataset !== 'string' || typeof body.threshold !== 'number') {
    return false;
  }

  if (!Array.isArray(body.points)) {
    return false;
  }

  return body.points.every(
    (point) =>
      isRecord(point) &&
      typeof point.date === 'string' &&
      typeof point.pass_rate === 'number' &&
      typeof point.total === 'number' &&
      typeof point.passed === 'number',
  );
};

export class EvalHarnessApiClient {
  constructor(
    private readonly baseUrl: string,
    private readonly tenantHeader?: string | null,
  ) {}

  private async request<T>(
    path: string,
    init?: RequestInit,
    expectedSchema?: string,
  validateShape?: SchemaValidator,
  ): Promise<ApiResult<T>> {
    const url = buildUrl(normalizeBaseUrl(this.baseUrl), path);

    const response = await fetch(url, init);

    if (response.status === 204) {
      return { data: undefined as never };
    }

    if (!response.ok) {
      return { error: classifyStatusError(response.status) };
    }

    try {
      const payload = (await response.json()) as unknown;
      return asResult<T>(payload, expectedSchema, validateShape);
    } catch {
      return {
        error: {
          kind: 'error',
          status: response.status,
          message: 'Invalid JSON response',
        },
      };
    }
  }

  private requestOptions(): RequestInit {
    const headers: HeadersInit = {
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    };

    if (this.tenantHeader) {
      headers[this.tenantHeader] = 'active';
    }

    return { headers, credentials: 'same-origin' as RequestCredentials };
  }

  async getReports(): Promise<ApiResult<ReportListPayload>> {
    return this.request<ReportListPayload>(
      '/reports',
      this.requestOptions(),
      undefined,
      (value): boolean =>
        isRecord(value) && typeof value.total === 'number' && Array.isArray(value.items),
    );
  }

  async getReport(id: string): Promise<ApiResult<ReportDetailPayload>> {
    return this.request<ReportDetailPayload>(
      `/reports/${encodeURIComponent(id)}`,
      this.requestOptions(),
      undefined,
      (value): boolean =>
        isRecord(value) &&
        typeof value.id === 'string' &&
        typeof value.dataset === 'string' &&
        typeof value.schema_version === 'string',
    );
  }

  async getReportCohorts(id: string): Promise<ApiResult<CohortsPayload>> {
    return this.request<CohortsPayload>(
      `/reports/${encodeURIComponent(id)}/cohorts`,
      this.requestOptions(),
      undefined,
      (value): boolean =>
        isRecord(value) &&
        typeof value.id === 'string' &&
        Array.isArray(value.cohorts),
    );
  }

  async getReportHistograms(id: string): Promise<ApiResult<HistogramsPayload>> {
    return this.request<HistogramsPayload>(
      `/reports/${encodeURIComponent(id)}/histograms`,
      this.requestOptions(),
      undefined,
      (value): boolean =>
        isRecord(value) &&
        typeof value.id === 'string' &&
        Array.isArray(value.buckets),
    );
  }

  async getReportDiff(id: string, otherId: string): Promise<ApiResult<DiffPayload>> {
    return this.request<DiffPayload>(
      `/reports/${encodeURIComponent(id)}/diff/${encodeURIComponent(otherId)}`,
      this.requestOptions(),
      'eval-harness.report-api.v1.diff',
      (value): boolean =>
        isRecord(value) &&
        typeof value.from === 'string' &&
        typeof value.to === 'string' &&
        Array.isArray(value.metrics),
    );
  }

  async getDatasetTrend(name: string, limit = 30): Promise<ApiResult<TrendPayload>> {
    return this.request<TrendPayload>(
      `/datasets/${encodeURIComponent(name)}/trend?limit=${limit}`,
      this.requestOptions(),
      'eval-harness.report-api.v1.trend',
      (value): boolean =>
        isRecord(value) &&
        typeof value.dataset === 'string' &&
        Array.isArray(value.metrics),
    );
  }

  async getOnlineTrend(dataset: string, limit = 30): Promise<ApiResult<OnlineTrendPayload>> {
    // The core endpoint returns the standard enveloped shape
    // ({ schema_version, schema, data: { dataset, points, threshold } }).
    // We accept both the enveloped and a flattened shape (the latter is
    // what the e2e mock emits) and validate every field the UI relies on
    // so a malformed payload cannot produce a zero threshold or NaN
    // chart geometry.
    const result = await this.request<Record<string, unknown>>(
      `/online/${encodeURIComponent(dataset)}/trend?limit=${limit}`,
      this.requestOptions(),
      'eval-harness.report-api.v1.online-trend',
      (value): boolean => isValidOnlineTrend(onlineTrendBody(value)),
    );

    if (result.error || !result.data) {
      return { error: result.error };
    }

    return { data: onlineTrendBody(result.data) as unknown as OnlineTrendPayload };
  }

  async getAdversarialManifests(): Promise<ApiResult<{ items: AdversarialManifestSummary[] }>> {
    return this.request<{ items: AdversarialManifestSummary[] }>(
      '/adversarial/manifests',
      this.requestOptions(),
      'eval-harness.report-api.v1.adversarial-manifests',
      (value): boolean => isRecord(value) && Array.isArray(value.items),
    );
  }

  async getAdversarialManifestDetail(name: string): Promise<ApiResult<AdversarialManifestDetail>> {
    return this.request<AdversarialManifestDetail>(
      `/adversarial/manifests/${encodeURIComponent(name)}`,
      this.requestOptions(),
      'eval-harness.report-api.v1.adversarial-manifest',
      (value): boolean =>
        isRecord(value) &&
        typeof value.name === 'string' &&
        typeof value.runs === 'number' &&
        Array.isArray(value.items),
    );
  }

  async getLiveBatches(): Promise<ApiResult<{ items: LiveBatch[] }>> {
    return this.request<{ items: LiveBatch[] }>(
      '/batches/live',
      this.requestOptions(),
      'eval-harness.report-api.v1.batches-live',
      (value): boolean => isRecord(value) && Array.isArray(value.items),
    );
  }

  async getBatchProgress(id: string): Promise<ApiResult<LiveBatchProgress>> {
    return this.request<LiveBatchProgress>(
      `/batches/${encodeURIComponent(id)}/progress`,
      this.requestOptions(),
      'eval-harness.report-api.v1.batch-progress',
      (value): boolean =>
        isRecord(value) &&
        typeof value.batch_id === 'string' &&
        typeof value.started_at === 'string',
    );
  }

  getReportRowsCsvUrl(id: string): string {
    return buildUrl(normalizeBaseUrl(this.baseUrl), `/reports/${encodeURIComponent(id)}/rows.csv`);
  }

  getReportDownloadUrl(id: string): string {
    return buildUrl(normalizeBaseUrl(this.baseUrl), `/reports/${encodeURIComponent(id)}/download`);
  }
}

export const createApiClient = (apiBase: string, tenantHeader?: string | null): EvalHarnessApiClient =>
  new EvalHarnessApiClient(apiBase, tenantHeader);
