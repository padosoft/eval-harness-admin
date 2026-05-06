<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Eval Harness UI</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    @if (! app()->environment('testing'))
        @vite(['resources/css/app.css', 'resources/js/main.tsx'])
    @endif
    <script id="eval-harness-ui-bootstrap" type="application/json">
        {{ $appConfigJson }}
    </script>
</head>
<body class="bg-slate-50 text-slate-900 antialiased">
<div id="eval-harness-ui-root" data-api-base="{{ $apiBase }}" data-route-base="{{ $routeBase }}"></div>
</body>
</html>
