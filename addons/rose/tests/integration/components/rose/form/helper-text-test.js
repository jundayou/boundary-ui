/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | rose/form/helper-text', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    assert.expect(2);
    await render(hbs`
      <Rose::Form::HelperText>
        Helper text
      </Rose::Form::HelperText>
    `);
    assert.ok(find('.rose-form-helper-text'));
    assert.strictEqual(
      find('.rose-form-helper-text').textContent.trim(),
      'Helper text'
    );
  });
});
