<?php

use Illuminate\Support\Facades\Route;
use Padosoft\EvalHarnessUi\Http\Controllers\EvalHarnessUiController;
use Padosoft\EvalHarnessUi\UiConfig;

/** @var UiConfig $uiConfig */
$uiConfig = app(UiConfig::class);

Route::middleware($uiConfig->middleware())
    ->prefix($uiConfig->prefix())
    ->group(function () {
        Route::get('/{view?}', [EvalHarnessUiController::class, 'index'])
            ->where('view', '.*')
            ->name('eval-harness-ui.index');
    });
