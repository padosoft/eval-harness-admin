<?php

declare(strict_types=1);

$repoRoot = dirname(__DIR__, 2);
$routeBase = '/admin/eval-harness';
$apiBase = $routeBase . '/api';
$requestUri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$path = is_string($requestUri) ? $requestUri : '/';
$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

$jsonReports = [
    [
        'id' => 'rep-2026-05-06',
        'dataset' => 'rag.faq',
        'format' => 'json',
        'macro_f1' => 0.942,
        'sample_count' => 128,
        'finished_at' => '2026-05-06T10:30:00Z',
        'schema_version' => '1.0',
    ],
    [
        'id' => 'rep-2026-05-05',
        'dataset' => 'rag.faq',
        'format' => 'json',
        'macro_f1' => 0.891,
        'sample_count' => 95,
        'finished_at' => '2026-05-05T09:20:00Z',
        'schema_version' => '1.0',
    ],
    [
        'id' => 'rep-2026-05-04',
        'dataset' => 'support.bot',
        'format' => 'json',
        'macro_f1' => 0.887,
        'sample_count' => 160,
        'finished_at' => '2026-05-04T17:15:00Z',
        'schema_version' => '1.0',
    ],
];

$jsonReportDetails = [
    'rep-2026-05-06' => [
        'id' => 'rep-2026-05-06',
        'dataset' => 'rag.faq',
        'schema_version' => '1.0',
        'macro_f1' => 0.942,
        'sample_count' => 128,
        'finished_at' => '2026-05-06T10:30:00Z',
        'failures_count' => 2,
        'metrics' => [
            'macro_f1' => 0.942,
            'exact-match.mean' => 0.91,
            'llm-judge.pass_rate' => 0.89,
        ],
        'failures' => [
            ['category' => 'formatting', 'count' => 8],
            ['category' => 'hallucinations', 'count' => 4],
        ],
        'raw_json' => [
            'dataset' => 'rag.faq',
            'created_at' => '2026-05-06T10:30:00Z',
            'outcome' => 'ok',
        ],
    ],
];

$jsonCohorts = [
    'rep-2026-05-06' => [
        'id' => 'rep-2026-05-06',
        'cohorts' => [
            ['cohort' => 'billing', 'pass_rate' => 0.91, 'samples' => 34],
            ['cohort' => 'onboarding', 'pass_rate' => 0.88, 'samples' => 42],
        ],
        'schema_version' => '1.0',
    ],
];

$jsonHistograms = [
    'rep-2026-05-06' => [
        'id' => 'rep-2026-05-06',
        'buckets' => [
            ['min' => 0.0, 'max' => 0.2, 'count' => 2],
            ['min' => 0.2, 'max' => 0.4, 'count' => 8],
            ['min' => 0.4, 'max' => 0.6, 'count' => 14],
            ['min' => 0.6, 'max' => 0.8, 'count' => 20],
            ['min' => 0.8, 'max' => 1.0, 'count' => 18],
        ],
        'schema_version' => '1.0',
    ],
];

$jsonDiff = [
    'from' => 'rep-2026-05-06',
    'to' => 'rep-2026-05-05',
    'schema' => 'eval-harness.report-api.v1.diff',
    'metrics' => [
        ['metric' => 'macro_f1', 'delta' => 0.051, 'status' => 'improved'],
        ['metric' => 'exact-match.mean', 'delta' => -0.012, 'status' => 'regressed'],
    ],
    'cohorts' => [
        ['cohort' => 'billing', 'status' => 'stable', 'delta' => 0.0],
    ],
    'schema_version' => '1.0',
];

$jsonTrend = [
    'schema_version' => '1.0',
    'schema' => 'eval-harness.report-api.v1.trend',
    'dataset' => 'rag.faq',
    'cohorts' => ['all', 'billing', 'onboarding'],
    'metrics' => [
        [
            'metric' => 'macro_f1',
            'values' => [
                ['at' => '2026-05-04', 'value' => 0.881],
                ['at' => '2026-05-05', 'value' => 0.891],
                ['at' => '2026-05-06', 'value' => 0.942],
            ],
        ],
        [
            'metric' => 'tokens',
            'values' => [
                ['at' => '2026-05-04', 'value' => 10],
                ['at' => '2026-05-05', 'value' => 12],
                ['at' => '2026-05-06', 'value' => 15],
            ],
        ],
        [
            'metric' => 'latency',
            'values' => [
                ['at' => '2026-05-04', 'value' => 190],
                ['at' => '2026-05-05', 'value' => 175],
                ['at' => '2026-05-06', 'value' => 165],
            ],
        ],
    ],
];

$jsonAdversarial = [
    'schema_version' => '1.0',
    'schema' => 'eval-harness.report-api.v1.adversarial-manifests',
    'items' => [
        [
            'name' => 'nightly-red-team',
            'runs' => 42,
            'latest_f1' => 0.951,
            'compliance' => 'OWASP,NIST',
            'coverage' => 0.83,
            'latest_status' => 'ok',
        ],
        [
            'name' => 'eu-ai-act-smoke',
            'runs' => 18,
            'latest_f1' => 0.973,
            'compliance' => 'EU AI Act',
            'coverage' => 0.88,
            'latest_status' => 'ok',
        ],
    ],
];

$jsonAdversarialDetail = [
    'nightly-red-team' => [
        'schema_version' => '1.0',
        'schema' => 'eval-harness.report-api.v1.adversarial-manifest',
        'name' => 'nightly-red-team',
        'runs' => 42,
        'coverage' => 0.83,
        'latest_status' => 'ok',
        'compliance' => 'OWASP,NIST',
        'items' => [
            ['category' => 'formatting', 'failures' => 12],
            ['category' => 'toxic', 'failures' => 7],
        ],
        'cohorts' => [
            ['cohort' => 'billing', 'pass_rate' => 0.91],
            ['cohort' => 'onboarding', 'pass_rate' => 0.89],
        ],
    ],
];

$jsonLiveBatches = [
    'schema_version' => '1.0',
    'schema' => 'eval-harness.report-api.v1.batches-live',
    'items' => [
        [
            'id' => 'batch-01',
            'status' => 'running',
            'processed' => 64,
            'total' => 100,
            'ttl_seconds' => 820,
        ],
        [
            'id' => 'batch-02',
            'status' => 'running',
            'processed' => 8,
            'total' => 40,
            'ttl_seconds' => 600,
        ],
    ],
];

$jsonBatchProgress = [
    'batch-01' => [
        'schema_version' => '1.0',
        'schema' => 'eval-harness.report-api.v1.batch-progress',
        'batch_id' => 'batch-01',
        'status' => 'running',
        'processed' => 64,
        'total' => 100,
        'started_at' => '2026-05-06T10:00:00Z',
        'last_checkpoint' => '2026-05-06T10:15:00Z',
        'failures' => 1,
        'rate_per_sec' => 12.4,
    ],
    'batch-02' => [
        'schema_version' => '1.0',
        'schema' => 'eval-harness.report-api.v1.batch-progress',
        'batch_id' => 'batch-02',
        'status' => 'running',
        'processed' => 8,
        'total' => 40,
        'started_at' => '2026-05-06T10:05:00Z',
        'last_checkpoint' => '2026-05-06T10:06:00Z',
        'failures' => 0,
        'rate_per_sec' => 3.6,
    ],
];

$bootstrap = [
    'ui_version' => '0.1.0',
    'metric_labels' => [
        'exact-match.mean' => 'Exact match',
        'llm-judge.pass_rate' => 'Judge pass rate',
        'macro_f1' => 'Macro F1',
    ],
    'tenant_header' => null,
    'polling' => ['live_batches_seconds' => 3],
    'locale' => 'en',
    'shortcuts' => ['commandPalette' => 'mod+k'],
];

/**
 * @param array<string, mixed> $payload
 * @return never
 */
function sendJsonResponse(array $payload, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo encodePayload($payload);
    exit;
}

/**
 * @param array<string, mixed> $payload
 */
function encodePayload(array $payload): string
{
    $body = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    return $body === false ? '{}' : $body;
}

function sendTextResponse(string $body, string $contentType = 'text/plain'): never
{
    header('Content-Type: ' . $contentType);
    echo $body;
    exit;
}

function resolveContentType(string $path): string
{
    $extension = strtolower(pathinfo($path, PATHINFO_EXTENSION));

    return match ($extension) {
        'js' => 'application/javascript; charset=utf-8',
        'mjs' => 'application/javascript; charset=utf-8',
        'css' => 'text/css; charset=utf-8',
        'json' => 'application/json; charset=utf-8',
        'map' => 'application/json; charset=utf-8',
        'png' => 'image/png',
        'jpg', 'jpeg' => 'image/jpeg',
        'gif' => 'image/gif',
        'svg' => 'image/svg+xml',
        'ico' => 'image/x-icon',
        default => 'application/octet-stream',
    };
}

function serveStaticFile(string $absolutePath): never
{
    if (! is_file($absolutePath) || ! is_readable($absolutePath)) {
        sendTextResponse('Not found', 'text/plain');
    }

    $content = file_get_contents($absolutePath);
    if ($content === false) {
        sendTextResponse('Unable to read file', 'text/plain');
    }

    $contentType = resolveContentType($absolutePath);
    header('Content-Type: ' . $contentType);
    echo $content;
    exit;
}

/**
 * @param array<string, mixed> $bootstrap
 */
function serveUiIndex(string $routeBase, string $apiBase, array $bootstrap, string $repoRoot): never
{
    $manifestPath = $repoRoot . DIRECTORY_SEPARATOR . 'dist' . DIRECTORY_SEPARATOR . '.vite' . DIRECTORY_SEPARATOR . 'manifest.json';
    $mainFile = null;
    $cssFiles = [];
    $manifest = null;

    if (file_exists($manifestPath)) {
        $manifestContent = file_get_contents($manifestPath);
        if ($manifestContent !== false) {
            $manifest = json_decode($manifestContent, true);
        }
        if (is_array($manifest) && isset($manifest['resources/js/main.tsx'])) {
            $entry = $manifest['resources/js/main.tsx'];
            if (isset($entry['file'])) {
                $mainFile = (string) $entry['file'];
            }
            if (isset($entry['css']) && is_array($entry['css'])) {
                $cssFiles = $entry['css'];
            }
        }
    }

    $mainScript = $mainFile === null ? 'assets/app.js' : $mainFile;
    $cssLinks = '';

    if ($cssFiles !== []) {
        foreach ($cssFiles as $cssFile) {
            $cssLinks .= '<link rel="stylesheet" href="/dist/' . htmlspecialchars((string) $cssFile, ENT_QUOTES) . '">' . PHP_EOL;
        }
    }

    header('Content-Type: text/html; charset=utf-8');
    $bootstrapJson = encodePayload($bootstrap);
    $mainSrc = '/dist/' . ltrim((string) $mainScript, '/');
    $html = <<<HTML
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Eval Harness UI</title>
    {$cssLinks}
    <script id="eval-harness-ui-bootstrap" type="application/json">
        {$bootstrapJson}
    </script>
    <script type="module" src="{$mainSrc}"></script>
</head>
<body>
    <div id="eval-harness-ui-root" data-api-base="{$apiBase}" data-route-base="{$routeBase}"></div>
</body>
</html>
HTML;
    sendTextResponse($html, 'text/html; charset=utf-8');
}

if (in_array($method, ['GET', 'HEAD'], true) === false) {
    sendJsonResponse(['message' => 'Method not allowed'], 405);
}

$staticPath = realpath($repoRoot . DIRECTORY_SEPARATOR . ltrim($path, '/'));
if ($path !== '/' && $staticPath !== false && is_file($staticPath)) {
    serveStaticFile($staticPath);
}

if (str_starts_with($path, $apiBase)) {
    $apiPath = substr($path, strlen($apiBase));
    $apiPath = ltrim($apiPath, '/');

    if ($apiPath === 'reports' || $apiPath === '') {
        sendJsonResponse(['schema_version' => '1.0', 'items' => $jsonReports, 'total' => count($jsonReports)]);
    }

    if (preg_match('#^reports/([^/]+)/diff/([^/]+)$#', $apiPath, $matches)) {
        sendJsonResponse($jsonDiff);
    }

    if (preg_match('#^reports/([^/]+)/cohorts$#', $apiPath, $matches)) {
        $id = rawurldecode((string) $matches[1]);
        if (! array_key_exists($id, $jsonCohorts)) {
            sendJsonResponse(['message' => 'Report not found'], 404);
        }
        sendJsonResponse($jsonCohorts[$id]);
    }

    if (preg_match('#^reports/([^/]+)/histograms$#', $apiPath, $matches)) {
        $id = rawurldecode((string) $matches[1]);
        if (! array_key_exists($id, $jsonHistograms)) {
            sendJsonResponse(['message' => 'Report not found'], 404);
        }
        sendJsonResponse($jsonHistograms[$id]);
    }

    if (preg_match('#^reports/([^/]+)$#', $apiPath, $matches)) {
        $id = rawurldecode((string) $matches[1]);
        if (! array_key_exists($id, $jsonReportDetails)) {
            sendJsonResponse(['message' => 'Report not found'], 404);
        }
        sendJsonResponse($jsonReportDetails[$id]);
    }

    if (preg_match('#^reports/([^/]+)/rows\.csv$#', $apiPath, $matches)) {
        sendTextResponse("id,dataset,score\n{$matches[1]},rag.faq,0.942\n", 'text/csv');
    }

    if (preg_match('#^reports/([^/]+)/download$#', $apiPath, $matches)) {
        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename="report.json"');
        sendTextResponse(encodePayload($jsonReportDetails['rep-2026-05-06']), 'application/octet-stream');
    }

    if (preg_match('#^datasets/([^/]+)/trend$#', $apiPath, $matches)) {
        sendJsonResponse($jsonTrend);
    }

    if ($apiPath === 'adversarial/manifests') {
        sendJsonResponse($jsonAdversarial);
    }

    if (preg_match('#^adversarial/manifests/([^/]+)$#', $apiPath, $matches)) {
        $name = rawurldecode((string) $matches[1]);
        if (! array_key_exists($name, $jsonAdversarialDetail)) {
            sendJsonResponse(['message' => 'Manifest not found'], 404);
        }
        sendJsonResponse($jsonAdversarialDetail[$name]);
    }

    if ($apiPath === 'batches/live') {
        sendJsonResponse($jsonLiveBatches);
    }

    if (preg_match('#^batches/([^/]+)/progress$#', $apiPath, $matches)) {
        $batchId = rawurldecode((string) $matches[1]);
        if (! array_key_exists($batchId, $jsonBatchProgress)) {
            sendJsonResponse(['message' => 'Batch not found'], 404);
        }
        sendJsonResponse($jsonBatchProgress[$batchId]);
    }

    sendJsonResponse(['message' => 'No route'], 404);
}

if ($path === '/' || str_starts_with($path, $routeBase)) {
    serveUiIndex($routeBase, $apiBase, $bootstrap, $repoRoot);
}

sendTextResponse('Not found', 'text/plain');
