/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import ApplicationSerializer from './application';

export default class WorkerSerializer extends ApplicationSerializer {
  // =methods

  /**
   * If `adapterOptions.workerGeneratedAuthToken` is set,
   * then the payload is serialized via `serializedWithGeneratedToken`.
   * @override
   * @param {Snapshot} snapshot
   * @return {object}
   */
  serialize(snapshot) {
    let serialized = super.serialize(...arguments);
    const workerGeneratedAuthToken =
      snapshot?.adapterOptions?.workerGeneratedAuthToken;
    if (workerGeneratedAuthToken)
      serialized = this.serializeWithGeneratedToken(
        snapshot,
        workerGeneratedAuthToken
      );
    return serialized;
  }

  /**
   * Returns a payload with `worker_generated_auth_token` serialized.
   * @param {Snapshot} snapshot
   * @param {[string]} worker_generated_auth_token
   * @return {object}
   */
  serializeWithGeneratedToken(snapshot, workerGeneratedAuthToken) {
    return {
      scope_id: snapshot.attr('scope').scope_id,
      worker_generated_auth_token: workerGeneratedAuthToken,
    };
  }
}
