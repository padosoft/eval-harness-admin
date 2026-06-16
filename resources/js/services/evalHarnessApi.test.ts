import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createApiClient } from '@/services/evalHarnessApi';

describe('EvalHarnessApiClient', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('maps known statuses to app-level error kind', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 503,
      json: async () => ({}),
    } as Response);

    const client = createApiClient('/api');
    const response = await client.getReports();
    expect(response.error).toMatchObject({
      kind: 'unavailable',
      status: 503,
    });
  });

  it('reads json for 200 responses', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ schema_version: '1.0', items: [], total: 0 }),
    } as Response);

    const client = createApiClient('/api');
    const response = await client.getReports();
    expect(response.error).toBeUndefined();
    expect(response.data).toMatchObject({ items: [], total: 0, schema_version: '1.0' });
  });

  it('parses the online trend payload and validates the schema', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        schema_version: '1.0',
        schema: 'eval-harness.report-api.v1.online-trend',
        dataset: 'rag.faq',
        limit: 90,
        count: 2,
        threshold: 0.8,
        points: [
          { date: '2026-06-13', pass_rate: 0.86, total: 42, passed: 36 },
          { date: '2026-06-14', pass_rate: 0.72, total: 39, passed: 28 },
        ],
      }),
    } as Response);

    const client = createApiClient('/api');
    const response = await client.getOnlineTrend('rag.faq', 90);

    expect(response.error).toBeUndefined();
    expect(response.data).toMatchObject({ dataset: 'rag.faq', threshold: 0.8 });
    expect(response.data?.points).toHaveLength(2);
    expect(fetch).toHaveBeenCalledWith('/api/online/rag.faq/trend?limit=90', expect.any(Object));
  });

  it('rejects an online trend payload with the wrong schema', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        schema_version: '1.0',
        schema: 'eval-harness.report-api.v1.trend',
        dataset: 'rag.faq',
        points: [],
      }),
    } as Response);

    const client = createApiClient('/api');
    const response = await client.getOnlineTrend('rag.faq');

    expect(response.data).toBeUndefined();
    expect(response.error).toMatchObject({ kind: 'invalid' });
  });

  it('normalizes base URL', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ schema_version: '1.0', items: [], total: 0 }),
    } as Response);

    const client = createApiClient('https://host.test/api/');
    await client.getReports();

    expect(fetch).toHaveBeenCalledWith('https://host.test/api/reports', expect.any(Object));
  });
});
