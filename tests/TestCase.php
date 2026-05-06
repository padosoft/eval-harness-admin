<?php

declare(strict_types=1);

namespace Padosoft\EvalHarnessUi\Tests;

use Illuminate\Support\ServiceProvider;
use Orchestra\Testbench\TestCase as Orchestra;
use Padosoft\EvalHarnessUi\EvalHarnessUiServiceProvider;

abstract class TestCase extends Orchestra
{
    protected function getEnvironmentSetUp($app): void
    {
        $app['config']->set('app.key', 'base64:'.base64_encode(str_repeat('a', 32)));
        $app['config']->set('app.env', 'testing');
        $app['config']->set('app.debug', true);
        $app['config']->set('eval-harness-ui.enabled', false);
        $app['config']->set('eval-harness-ui.route_middleware', ['web']);
    }

    /**
     * @return array<int, class-string<ServiceProvider>>
     */
    protected function getPackageProviders($app): array
    {
        return [
            EvalHarnessUiServiceProvider::class,
        ];
    }
}
