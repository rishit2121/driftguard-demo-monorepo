'use strict';
// Scenario D: merges an UNTRUSTED profile update (request JSON body) over server defaults.
const _ = require('lodash');

const DEFAULT_PROFILE = {
  locale: 'en-US',
  notifications: { email: true, sms: false, digest: { frequency: 'weekly', hour: 9 } },
  theme: { mode: 'system', accent: 'blue' },
};

function mergeProfile(untrustedPayload) {
  return _.defaultsDeep({}, untrustedPayload, DEFAULT_PROFILE);
}

module.exports = { mergeProfile, DEFAULT_PROFILE };
