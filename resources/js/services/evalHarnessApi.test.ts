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
