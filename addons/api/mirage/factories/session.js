/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import factory from '../generated/factories/session';
import { trait } from 'miragejs';
import { faker } from '@faker-js/faker';
import generateId from '../helpers/id';

const statusStrings = ['pending', 'active', 'canceling', 'terminated'];

export const pickRandomStatusString = () =>
  faker.helpers.arrayElement(statusStrings);

export default factory.extend({
  id: () => generateId('ss_'),

  status: pickRandomStatusString,

  /**
   * Sessions generated with this trait will automatically form
   * associations to user, target, host set, and host (if available) within
   * the current scope.
   */
  withAssociations: trait({
    afterCreate(record, server) {
      const scopeId = record.scopeId;

      // Assign a user to this session if not already assigned.
      if (record.scope && !record.user) {
        const scopeId =
          record.scope.type === 'project'
            ? record.scope?.scope.id
            : record.scope.id;
        const user = server.schema.users.where({ scopeId }).models[0];
        if (user) record.update({ user });
      }

      // Assign target and host set to this session, if not already assigned.
      const target = server.schema.targets.where({ scopeId }).models[0];
      if (target) {
        record.update({ target });
        const hostSet = target.hostSets.models[0];
        if (hostSet) {
          record.update({ hostSet });
          const host = hostSet.hosts.models[0];
          if (host) record.update({ host });
        }
      }
    },
  }),
});
