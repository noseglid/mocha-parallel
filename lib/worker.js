var EventEmitter = require('events').EventEmitter,
    exec = require('child_process').exec;


function Worker() {
  EventEmitter.apply(this, arguments);
}
module.exports = Worker;


Worker.prototype = {
  __proto__: EventEmitter.prototype,

  /**
   * @type {Array}
   */
  queue: null,

  work: function() {
    // No work left... sad!
    if (!this.queue || this.queue.length === 0) {
      return this.emit('complete');
    }

    var next = this.queue.pop();
    // Execute test case.
    exec(next, function(err, stdout, stderr) {
      var results = { passing: 0, pending: 0, failing: 0, failures: [] };

      // Parse mocha epilogue.
      [
        'passing',
        'pending',
        'failing'
      ].forEach(function(resultType) {
        var regex = new RegExp('(\\d+) ' + resultType);
        var match = regex.exec(stdout);
        var count = match === null ? 0 : parseInt(match[1]);
        results[resultType] = count;
      });

      // Epilogue test failures get written to stderr.
      if (!/\s+/.test(stderr)) {
        results.failures.push(stderr);
      }

      this.emit('results', results);
      this.work();
    }.bind(this));
  }
};