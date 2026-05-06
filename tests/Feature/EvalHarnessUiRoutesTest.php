<?php

declare(strict_types=1);

use Padosoft\EvalHarnessUi\Tests\TestCase;

describe('Eval Harness UI routes', function () {
    it('does not register routes when module disabled', function () {
        /** @var TestCase $this */
        config()->set('eval-harness-ui.enabled', false);

        $this->get('/admin/eval-harness')->assertStatus(404);
    });

    it('registers SPA route when enabled', function () {
        /** @var TestCase $this */
        config()->set('eval-harness-ui.enabled', true);
        config()->set('eval-harness-ui.prefix', 'admin/eval-harness');

        $response = $this->get('/admin/eval-harness');
        $response->assertStatus(200);
        $response->assertSee('eval-harness-ui-root');
    });

    it('loads config keys through service provider', function () {
        /** @var TestCase $this */
        config()->set('eval-harness-ui.enabled', true);
        config()->set('eval-harness-ui.prefix', 'admin/eval-harness');

        $response = $this->get('/admin/eval-harness');

        $response->assertStatus(200);
        $response->assertSee('eval-harness-ui-bootstrap');
        $response->assertSee('eval-harness-ui-root');
        $response->assertSee('"ui_version"');
    });
});
