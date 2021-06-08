import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | card', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<Card />`);
    assert.ok(find('.card'));
  });

  test('it renders with content', async function (assert) {
    await render(hbs`
      <Card as |card|>
        <card.header></card.header>
        <card.body></card.body>
        <card.footer></card.footer>
      </Card>
    `);

    assert.ok(find('.card'));
    assert.ok(find('.card-header'));
    assert.ok(find('.card-body'));
    assert.ok(find('.card-footer'));
  });

  test('header renders an icon when defined', async function (assert) {
    await render(hbs`
      <Card
        @heading='This is a heading test'
        @icon='key'
      as |card|>
        <card.header></card.header>
        <card.body></card.body>
        <card.footer></card.footer>
      </Card>
    `);

    assert.ok(find('.card'));
    assert.ok(find('.card-header'));
    assert.ok(find('.card-header .rose-icon'));
    assert.equal(this.element.textContent.trim(), 'This is a heading test');
  });
});
