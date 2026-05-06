<?php

namespace Padosoft\EvalHarnessUi;

use Illuminate\Support\ServiceProvider;

class EvalHarnessUiServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(__DIR__.'/../config/eval-harness-ui.php', 'eval-harness-ui');

        $this->app->singleton(UiConfig::class, fn () => new UiConfig(config('eval-harness-ui')));
    }

    public function boot(): void
    {
        if ($this->app->runningInConsole()) {
            $this->publishes([
                __DIR__.'/../config/eval-harness-ui.php' => config_path('eval-harness-ui.php'),
            ], 'eval-harness-ui-config');

            $this->publishes([
                __DIR__.'/../resources/views' => resource_path('views/vendor/eval-harness-ui'),
            ], 'eval-harness-ui-views');

            $this->publishes([
                __DIR__.'/../resources/js' => resource_path('js/eval-harness-ui'),
                __DIR__.'/../resources/css' => resource_path('css/eval-harness-ui'),
            ], 'eval-harness-ui-assets');
        }

        $this->loadViewsFrom(__DIR__.'/../resources/views', 'eval-harness-ui');

        $this->loadRoutesFrom(__DIR__.'/../routes/web.php');
    }
}
