var EventEmitter = require('events').EventEmitter,
    spawn = require('child_process').spawn;


function Worker(opts) {
  EventEmitter.call(this);

  for (var key in opts) {
    this[key] = opts[key];
  }
}
module.exports = Worker;


Worker.prototype = {
  __proto__: EventEmitter.prototype,

  /**
   * @type {String}
   */
  cwd: null,

  /**
   * @type {Object}
   */
  env: null,

  /**
   * @type {Array}
   */
  queue: null,

  work: function() {
    // No work left... sad!
    if (!this.queue || this.queue.length === 0) {
      return this.emit('complete');
    }

    var next = this.queue.pop().split(' ');
    var command = next[0];
    var args = next.slice(1);

    // Execute test case.
    var opts = {};
    if (this.cwd) {
      opts.cwd = this.cwd;
    }
    if (this.env) {
      opts.env = this.env;
    }

    var mocha = spawn(command, args, opts);

    var stdout;
    mocha.stdout.on('data', function(data) {
      stdout += data;
    });

    var stderr;
    mocha.stderr.on('data', function(data) {
      if (/\d+ failing/.test(data)) {
        stdout += data;
      } else if (/\d+\)\s+/.test(data)) {
        // Collect the error traces in stderr.
        stderr += data;
      } else {
        // Swallow other warnings to stderr for now.
      }
    });

    mocha.on('error', function(error) {
      console.error('error: ' + error);
    });

    mocha.on('exit', function() {
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
      if (!/^\s+$/.test(stderr)) {
        results.failures.push(stderr);
      }

      this.emit('results', results);
      this.work();
    }.bind(this));
  }
};