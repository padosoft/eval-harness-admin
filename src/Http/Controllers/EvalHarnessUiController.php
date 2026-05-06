<?php

namespace Padosoft\EvalHarnessUi\Http\Controllers;

use Padosoft\EvalHarnessUi\UiConfig;
use Illuminate\Contracts\View\View;
use Illuminate\Http\Request;

class EvalHarnessUiController
{
    public function index(Request $request): View
    {
        if (! config('eval-harness-ui.enabled', false)) {
            abort(404);
        }

        $uiConfig = new UiConfig(config('eval-harness-ui'));

        return view('eval-harness-ui::app', [
            'apiBase' => $this->apiBase($request),
            'routeBase' => $uiConfig->prefix(),
            'appConfigJson' => $this->configPayload(),
        ]);
    }

    private function apiBase(Request $request): string
    {
        $apiBase = config('eval-harness-ui.api_base', '/admin/eval-harness/api');

        return str_starts_with($apiBase, 'http')
            ? $apiBase
            : rtrim($request->getSchemeAndHttpHost() . $apiBase, '/');
    }

    private function configPayload(): string
    {
        $metricLabels = config('eval-harness-ui.metric_labels', []);
        $tenantHeader = config('eval-harness-ui.tenant_header', null);
        $commandPalette = config('eval-harness-ui.assets.command_palette_shortcut', 'mod+k');
        $locale = config('eval-harness-ui.locale', app()->getLocale());
        $normalizedLocale = is_string($locale) ? strtolower(explode('_', $locale, 2)[0]) : 'en';

        return json_encode([
            'ui_version' => '0.1.0',
            'metric_labels' => $metricLabels,
            'tenant_header' => is_string($tenantHeader) ? $tenantHeader : null,
            'polling' => config('eval-harness-ui.polling', []),
            'locale' => in_array($normalizedLocale, ['en', 'it'], true) ? $normalizedLocale : 'en',
            'shortcuts' => [
                'commandPalette' => is_string($commandPalette) && trim($commandPalette) !== '' ? trim($commandPalette) : 'mod+k',
            ],
        ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
    }
}
