import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Unit | Model | target', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  test('it has a `hostSets` array of resolved model instances (if those instances are already in the store)', function (assert) {
    assert.expect(6);
    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: '123abc',
        type: 'target',
        attributes: {
          host_sets: [
            { host_source_id: '1', host_catalog_id: '2' },
            { host_source_id: '3', host_catalog_id: '2' },
          ],
        },
      },
    });
    const target = store.peekRecord('target', '123abc');
    assert.equal(
      target.host_sets.length,
      2,
      'Target has two entires in host_sets'
    );
    assert.equal(
      target.hostSets.length,
      0,
      'Target has no resolved hostSets because they are not loaded yet'
    );
    store.push({
      data: {
        id: '1',
        type: 'host-set',
        attributes: {},
      },
    });
    store.push({
      data: {
        id: '3',
        type: 'host-set',
        attributes: {},
      },
    });
    // Since `hostSets` is computed on `host_sets`, not the store itself,
    // it's necessary to do this assignment to kick-off the computed update.
    // eslint-disable-next-line no-self-assign
    target.host_sets = target.host_sets;
    assert.equal(
      target.host_sets.length,
      2,
      'Target has two entires in host_sets'
    );
    assert.equal(target.hostSets.length, 2, 'Target has two resolved hostSets');
    assert.notOk(
      target.hostSets[0].hostCatalog,
      'Host catalog was not resolved because it is not loaded yet'
    );
    store.push({
      data: {
        id: '2',
        type: 'host-catalog',
        attributes: {},
      },
    });
    // eslint-disable-next-line no-self-assign
    target.host_sets = target.host_sets;
    assert.ok(target.hostSets[0].hostCatalog, 'Host catalog is resolved');
  });

  test('it has an `addHostSets` method that targets a specific POST API endpoint and serialization', async function (assert) {
    assert.expect(1);
    this.server.post('/v1/targets/123abc:add-host-sets', (schema, request) => {
      const body = JSON.parse(request.requestBody);
      assert.deepEqual(body, {
        host_set_ids: ['123_abc', 'foobar'],
        version: 1,
      });
      return { id: '123abc' };
    });
    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: '123abc',
        type: 'target',
        attributes: {
          name: 'Target',
          description: 'Description',
          host_sets: [
            { host_source_id: '1', host_catalog_id: '2' },
            { host_source_id: '3', host_catalog_id: '4' },
          ],
          version: 1,
          scope: {
            scope_id: 'o_1',
            type: 'scope',
          },
        },
      },
    });
    const model = store.peekRecord('target', '123abc');
    await model.addHostSets(['123_abc', 'foobar']);
  });

  test('it has a `removeHostSets` method that targets a specific POST API endpoint and serialization', async function (assert) {
    assert.expect(1);
    this.server.post(
      '/v1/targets/123abc:remove-host-sets',
      (schema, request) => {
        const body = JSON.parse(request.requestBody);
        assert.deepEqual(body, {
          host_set_ids: ['1', '3'],
          version: 1,
        });
        return { id: '123abc' };
      }
    );
    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: '123abc',
        type: 'target',
        attributes: {
          name: 'Target',
          description: 'Description',
          host_sets: [
            { host_source_id: '1', host_catalog_id: '2' },
            { host_source_id: '3', host_catalog_id: '4' },
          ],
          version: 1,
          scope: {
            scope_id: 'o_1',
            type: 'scope',
          },
        },
      },
    });
    const model = store.peekRecord('target', '123abc');
    await model.removeHostSets(['1', '3']);
  });

  test('it has a `removeHostSet` method that deletes a single host set using `removeHostSets` method', async function (assert) {
    assert.expect(1);
    this.server.post(
      '/v1/targets/123abc:remove-host-sets',
      (schema, request) => {
        const body = JSON.parse(request.requestBody);
        assert.deepEqual(body, {
          host_set_ids: ['3'],
          version: 1,
        });
        return { id: '123abc' };
      }
    );
    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: '123abc',
        type: 'target',
        attributes: {
          name: 'Target',
          description: 'Description',
          host_sets: [
            { host_source_id: '1', host_catalog_id: '2' },
            { host_source_id: '3', host_catalog_id: '4' },
          ],
          version: 1,
          scope: {
            scope_id: 'o_1',
            type: 'scope',
          },
        },
      },
    });
    const model = store.peekRecord('target', '123abc');
    await model.removeHostSet('3');
  });

  test('it has a `sessions` array of session instances associated with the target (if those instances are already in the store)', function (assert) {
    assert.expect(3);
    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: '123abc',
        type: 'target',
      },
    });
    const target = store.peekRecord('target', '123abc');
    assert.equal(target.sessions.length, 0);
    store.push({
      data: {
        id: '1',
        type: 'session',
        attributes: { target_id: '123abc' },
      },
    });
    store.push({
      data: {
        id: '2',
        type: 'session',
        attributes: { target_id: '123abc' },
      },
    });
    store.push({
      data: {
        id: '3',
        type: 'session',
        attributes: { target_id: '456xyz' },
      },
    });
    assert.equal(
      store.peekAll('session').length,
      3,
      'There are 3 sessions loaded in the store'
    );
    assert.equal(
      target.sessions.length,
      2,
      'Target has two associated sessions loaded in the store'
    );
  });

  test('it has a `credentialLibraries` array of resolved model instances (if those instances are already in the store)', function (assert) {
    assert.expect(4);
    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: '123abc',
        type: 'target',
        attributes: {
          application_credential_library_ids: [{ value: '1' }, { value: '2' }],
        },
      },
    });
    const target = store.peekRecord('target', '123abc');
    assert.equal(
      target.application_credential_library_ids.length,
      2,
      'Target has two entires in application_credential_library_ids'
    );
    assert.equal(
      target.credentialLibraries.length,
      0,
      'Target has no resolved credentialLibraries because they are not loaded yet'
    );
    store.push({
      data: {
        id: '1',
        type: 'credential-library',
        attributes: {},
      },
    });
    store.push({
      data: {
        id: '2',
        type: 'credential-library',
        attributes: {},
      },
    });
    // Since `credentialLibraries` is computed on `application_credential_library_ids`,
    // not the store itself, it's necessary to do this assignment to kick-off the
    // computed update.
    /* eslint-disable no-self-assign */
    target.application_credential_library_ids =
      target.application_credential_library_ids;
    /* eslint-enable no-self-assign */
    assert.equal(
      target.application_credential_library_ids.length,
      2,
      'Target has two entires in application_credential_library_ids'
    );
    assert.equal(
      target.credentialLibraries.length,
      2,
      'Target has two resolved credentialLibraries'
    );
  });

  test('it has an `addCredentialLibraries` method that targets a specific POST API endpoint and serialization', async function (assert) {
    assert.expect(1);
    this.server.post(
      '/v1/targets/123abc:add-credential-libraries',
      (schema, request) => {
        const body = JSON.parse(request.requestBody);
        assert.deepEqual(body, {
          application_credential_library_ids: ['123_abc', 'foobar'],
          version: 1,
        });
        return { id: '123abc' };
      }
    );
    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: '123abc',
        type: 'target',
        attributes: {
          name: 'Target',
          description: 'Description',
          application_credential_library_ids: [{ value: '1' }, { value: '2' }],
          version: 1,
          scope: {
            scope_id: 'o_1',
            type: 'scope',
          },
        },
      },
    });
    const model = store.peekRecord('target', '123abc');
    await model.addCredentialLibraries(['123_abc', 'foobar']);
  });

  test('it has a `removeCredentialLibraries` method that targets a specific POST API endpoint and serialization', async function (assert) {
    assert.expect(1);
    this.server.post(
      '/v1/targets/123abc:remove-credential-libraries',
      (schema, request) => {
        const body = JSON.parse(request.requestBody);
        assert.deepEqual(body, {
          application_credential_library_ids: ['1', '2'],
          version: 1,
        });
        return { id: '123abc' };
      }
    );
    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: '123abc',
        type: 'target',
        attributes: {
          name: 'Target',
          description: 'Description',
          application_credential_library_ids: [{ value: '1' }, { value: '2' }],
          version: 1,
          scope: {
            scope_id: 'o_1',
            type: 'scope',
          },
        },
      },
    });
    const model = store.peekRecord('target', '123abc');
    await model.removeCredentialLibraries(['1', '2']);
  });

  test('it has a `removeCredentialLibrary` method that deletes a single credential library using `removeCredentialLibraries` method', async function (assert) {
    assert.expect(1);
    this.server.post(
      '/v1/targets/123abc:remove-credential-libraries',
      (schema, request) => {
        const body = JSON.parse(request.requestBody);
        assert.deepEqual(body, {
          application_credential_library_ids: ['2'],
          version: 1,
        });
        return { id: '123abc' };
      }
    );
    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: '123abc',
        type: 'target',
        attributes: {
          name: 'Target',
          description: 'Description',
          application_credential_library_ids: [{ value: '1' }, { value: '2' }],
          version: 1,
          scope: {
            scope_id: 'o_1',
            type: 'scope',
          },
        },
      },
    });
    const model = store.peekRecord('target', '123abc');
    await model.removeCredentialLibrary('2');
  });
});
