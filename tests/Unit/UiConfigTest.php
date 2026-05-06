<?php

declare(strict_types=1);

use Padosoft\EvalHarnessUi\UiConfig;

describe('UiConfig', function () {
    it('reads route middleware from route_middleware alias', function () {
        config()->set('eval-harness-ui', [
            'enabled' => true,
            'route_middleware' => ['web', 'auth'],
            'polling' => ['live_batches_seconds' => 12],
        ]);

        $config = new UiConfig(config('eval-harness-ui'));

        expect($config->middleware())->toBe(['web', 'auth']);
        expect($config->pollingLiveBatchesSeconds())->toBe(12);
    });

    it('accepts schema old middleware key for backwards compatibility', function () {
        config()->set('eval-harness-ui', [
            'enabled' => true,
            'middleware' => ['web', 'can:eval-harness.viewer'],
            'polling' => ['trend_seconds' => 600],
        ]);

        $config = new UiConfig(config('eval-harness-ui'));

        expect($config->middleware())->toBe(['web', 'can:eval-harness.viewer']);
        expect($config->pollingTrendSeconds())->toBe(600);
    });

    it('parses middleware from comma-separated env-like string', function () {
        config()->set('eval-harness-ui', [
            'enabled' => true,
            'route_middleware' => 'web, auth, can:eval-harness.viewer',
        ]);

        $config = new UiConfig(config('eval-harness-ui'));

        expect($config->middleware())->toBe(['web', 'auth', 'can:eval-harness.viewer']);
    });

});
