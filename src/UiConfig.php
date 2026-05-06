<?php

namespace Padosoft\EvalHarnessUi;

use Illuminate\Support\Arr;

final class UiConfig
{
    /** @param array<string, mixed> $config */
    public function __construct(private readonly array $config)
    {
    }

    public function enabled(): bool
    {
        return (bool) Arr::get($this->config, 'enabled', false);
    }

    public function prefix(): string
    {
        return (string) Arr::get($this->config, 'prefix', 'admin/eval-harness');
    }

    /** @return list<string> */
    public function middleware(): array
    {
        $middleware = Arr::get(
            $this->config,
            'route_middleware',
            Arr::get($this->config, 'middleware', ['web'])
        );

        if (! is_array($middleware)) {
            if (is_string($middleware)) {
                return array_map(
                    'trim',
                    preg_split('/\s*,\s*/', $middleware, -1, PREG_SPLIT_NO_EMPTY) ?: []
                );
            }

            return ['web'];
        }

        return array_values(array_map('strval', $middleware));
    }

    public function apiBase(): string
    {
        return (string) Arr::get($this->config, 'api_base', '/admin/eval-harness/api');
    }

    public function tenantHeader(): ?string
    {
        $header = Arr::get($this->config, 'tenant_header', null);

        return is_string($header) && trim($header) !== '' ? trim($header) : null;
    }

    public function pollingLiveBatchesSeconds(): int
    {
        return $this->pollingSeconds('live_batches_seconds', 3);
    }

    public function pollingReportListSeconds(): int
    {
        return $this->pollingSeconds('report_list_seconds', 30);
    }

    public function pollingTrendSeconds(): int
    {
        return $this->pollingSeconds('trend_seconds', 300);
    }

    /** @return array<string, string> */
    public function metricLabels(): array
    {
        return (array) Arr::get($this->config, 'metric_labels', []);
    }

    public function pollingSeconds(string $key, int $default): int
    {
        return (int) Arr::get($this->config, "polling.{$key}", $default);
    }
}
