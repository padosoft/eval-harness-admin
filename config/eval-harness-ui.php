<?php

return [
    'enabled' => env('EVAL_HARNESS_UI_ENABLED', false),
    'prefix' => env('EVAL_HARNESS_UI_PREFIX', 'admin/eval-harness'),
    'route_middleware' => env(
        'EVAL_HARNESS_UI_MIDDLEWARE',
        ['web', 'auth', 'can:eval-harness.viewer']
    ),
    'api_base' => env('EVAL_HARNESS_API_BASE', '/admin/eval-harness/api'),
    'tenant_header' => env('EVAL_HARNESS_TENANT_HEADER', 'X-Eval-Harness-Tenant'),
    'locale' => env('EVAL_HARNESS_UI_LOCALE', env('APP_LOCALE', 'en')),
    'schema_version' => [
        'required' => true,
        'min_supported' => '1.0',
    ],
    'metric_labels' => [
        'exact-match.mean' => 'Exact match',
        'llm-judge.pass_rate' => 'Judge pass rate',
        'macro_f1' => 'Macro F1',
    ],
    'polling' => [
        'live_batches_seconds' => 3,
        'report_list_seconds' => 30,
        'trend_seconds' => 300,
    ],
    'assets' => [
        'command_palette_shortcut' => 'mod+k',
    ],
];
