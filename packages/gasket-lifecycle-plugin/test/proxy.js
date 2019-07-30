const EventEmitter = require('events');

//
// Export a pre-initialized eventemitter so our lifecycle hooks can emit
// events on the eventemitter, and we can listen to those events in our
// test file.
//
module.exports = new EventEmitter();
