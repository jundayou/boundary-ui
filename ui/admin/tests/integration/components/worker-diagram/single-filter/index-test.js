/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'admin/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';

module(
  'Integration | Component | worker-diagram/single-filter',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks);

    test('it renders the correct diagram when egress filter is false', async function (assert) {
      assert.expect(2);
      await render(
        hbs`<WorkerDiagram::SingleFilter @egressWorkerFilterEnabled={{false}} />`
      );

      assert.dom('[data-test-single-filter-egress-off]').isVisible();
      assert.dom('[data-test-single-filter-egress-on]').doesNotExist();
    });

    test('it renders the correct diagram when egress filter is true', async function (assert) {
      assert.expect(2);
      await render(
        hbs`<WorkerDiagram::SingleFilter @egressWorkerFilterEnabled={{true}} />`
      );

      assert.dom('[data-test-single-filter-egress-on]').isVisible();
      assert.dom('[data-test-single-filter-egress-off]').doesNotExist();
    });
  }
);
