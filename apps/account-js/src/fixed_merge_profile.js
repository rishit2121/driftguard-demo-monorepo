'use strict';
// Expected safe behavior fixture: input/output pairs any correct mergeProfile must satisfy.
module.exports = [
  {
    name: 'nested defaults are filled in',
    input: { notifications: { sms: true, digest: { hour: 7 } } },
    expected: {
      locale: 'en-US',
      notifications: { email: true, sms: true, digest: { frequency: 'weekly', hour: 7 } },
      theme: { mode: 'system', accent: 'blue' },
    },
  },
  {
    name: 'user values win over defaults',
    input: { locale: 'fr-FR', theme: { mode: 'dark' } },
    expected: {
      locale: 'fr-FR',
      notifications: { email: true, sms: false, digest: { frequency: 'weekly', hour: 9 } },
      theme: { mode: 'dark', accent: 'blue' },
    },
  },
];
