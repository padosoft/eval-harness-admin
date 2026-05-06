import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from '@/app';
import { AppContextProvider } from '@/context/AppContext';
import { parseBootstrapConfig } from '@/utils/bootstrap';

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: RequestInfo | URL) => {
      const endpoint = String(url);

      if (endpoint.endsWith('/reports')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            schema_version: '1.0',
            items: [
              {
                id: 'r-1',
                dataset: 'rag.faq',
                format: 'json',
                macro_f1: 0.92,
                sample_count: 128,
                finished_at: '2026-05-06T10:30:00Z',
              },
            ],
            total: 1,
          }),
        } as Response;
      }

      if (endpoint.endsWith('/adversarial/manifests')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ schema_version: '1.0', items: [{ name: 'baseline', runs: 2, coverage: 0.91 }] }),
        } as Response;
      }

      if (endpoint.endsWith('/batches/live')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            schema_version: '1.0',
            items: [{ id: 'b-1', status: 'running', processed: 4, total: 10, ttl_seconds: 10 }],
          }),
        } as Response;
      }

      return {
        ok: true,
        status: 200,
        json: async () => ({ schema_version: '1.0' }),
      } as Response;
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('App routes shell', () => {
  it('shows dashboard and navigation items', async () => {
    const bootstrap = parseBootstrapConfig(
      JSON.stringify({
        ui_version: '0.1.0',
        metric_labels: {},
        tenant_header: null,
        polling: { live_batches_seconds: 3 },
      }),
    );

    render(
      <AppContextProvider apiBase="https://example.test/api" config={bootstrap}>
        <MemoryRouter initialEntries={['/']}>
          <App title="Eval Harness UI" version={bootstrap.ui_version} />
        </MemoryRouter>
      </AppContextProvider>,
    );

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByText('Reports List')).toBeInTheDocument();
    expect(screen.getByText('Compare')).toBeInTheDocument();
    expect(screen.getByText('Live Batches')).toBeInTheDocument();
  });
});
