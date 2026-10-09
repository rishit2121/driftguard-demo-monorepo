'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { mergeProfile, DEFAULT_PROFILE } = require('../src/merge_profile.js');
const cases = require('../src/fixed_merge_profile.js');

for (const c of cases) {
  test(`mergeProfile: ${c.name}`, () => {
    assert.deepEqual(mergeProfile(c.input), c.expected);
  });
}

test('defaults object is not mutated', () => {
  mergeProfile({ notifications: { digest: { hour: 1 } } });
  assert.equal(DEFAULT_PROFILE.notifications.digest.hour, 9);
});
