/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import ApplicationSerializer from './application';
import { TYPE_TARGET_SSH } from '../models/target';

export default class TargetSerializer extends ApplicationSerializer {
  // =methods

  /**
   * If `adapterOptions.hostSets` is set to an array of host set models,
   * the resulting target serialization should include **only host sets**
   * and the version.
   * If `adapterOptions.credentialSources` is set to an array of
   * credential library and credential models, the resulting target serialization should
   * include **only credential libraries and crendentials** and the version.
   * Normally, neither host sets or credential libraries or credentials are not serialized.
   * @override
   * @param {Snapshot} snapshot
   * @return {object}
   */
  serialize(snapshot) {
    let serialized = super.serialize(...arguments);
    const { type } = snapshot.record;
    const hostSourceIDs = snapshot?.adapterOptions?.hostSetIDs;
    if (hostSourceIDs) {
      serialized = this.serializeWithHostSources(snapshot, hostSourceIDs);
    }
    const brokeredCredentialSourceIDs =
      snapshot?.adapterOptions?.brokeredCredentialSourceIDs;
    const injectedApplicationCredentialSourceIDs =
      snapshot?.adapterOptions?.injectedApplicationCredentialSourceIDs;

    if (brokeredCredentialSourceIDs)
      serialized = this.serializeWithBrokeredCredentialSources(
        snapshot,
        brokeredCredentialSourceIDs
      );
    if (injectedApplicationCredentialSourceIDs)
      serialized = this.serializeWithInjectedApplicationCredentialSources(
        snapshot,
        injectedApplicationCredentialSourceIDs
      );

    // Delete session recording related fields from non-SSH targets
    if (type !== TYPE_TARGET_SSH) {
      delete serialized?.attributes?.storage_bucket_id;
      delete serialized?.attributes?.enable_session_recording;
    }
    return serialized;
  }

  /**
   * Returns a payload containing only version and an array of passed IDs,
   * rather than existing instances on the model.
   * @param {Snapshot} snapshot
   * @param {[string]} hostSetIDs
   * @return {object}
   */
  serializeWithHostSources(snapshot, hostSourceIDs) {
    return {
      version: snapshot.attr('version'),
      host_source_ids: hostSourceIDs,
    };
  }

  /**
   * Returns a payload containing only version and an array of passed IDs,
   * rather than existing instances on the model.
   * @param {Snapshot} snapshot
   * @param {[string]} brokered_credential_source_ids
   * @return {object}
   */
  serializeWithBrokeredCredentialSources(
    snapshot,
    brokered_credential_source_ids
  ) {
    return {
      version: snapshot.attr('version'),
      brokered_credential_source_ids,
    };
  }

  /**
   * Returns a payload containing only version and an array of passed IDs,
   * rather than existing instances on the model.
   * @param {Snapshot} snapshot
   * @param {[string]} injected_application_credential_source_ids
   * @return {object}
   */
  serializeWithInjectedApplicationCredentialSources(
    snapshot,
    injected_application_credential_source_ids
  ) {
    return {
      version: snapshot.attr('version'),
      injected_application_credential_source_ids,
    };
  }

  /**
   * Returns a payload containing only version and storage bucket id,
   * rather than existing instances on the model.
   * @param {Snapshot} snapshot
   * @returns {object}
   */
  serializeWithStorageBucket(snapshot) {
    return {
      version: snapshot.attr('version'),
      storage_bucket_id: snapshot?.attr('storage_bucket_id'),
    };
  }
}
