'use strict';

var util = require('util');
var EventEmitter = require('events').EventEmitter;
var debug = require('debug')('worker');
var spawn = require('child_process').spawn;

function Worker(opts) {
  EventEmitter.call(this);

  this.cwd = opts.cwd || null;
  this.env = opts.env || null;
  this.queue = opts.queue || null;
  this.isBusy = false;
  for (var key in opts) {
    this[key] = opts[key];
  }
}

util.inherits(Worker, EventEmitter);

module.exports = Worker;

Worker.prototype.work = function () {
  if (!this.queue || this.queue.length === 0) {
    // No work left... sad!
    this.isBusy = false;
    return this.emit('complete');
  }

  this.isBusy = true;
  var next = this.queue.pop().split(' ');
  var command = next[0];
  var args = next.slice(1).filter(function (arg) {
    return !/^\s*$/.test(arg);
  });

  // Execute test case.
  var opts = {};
  if (this.cwd) {
    opts.cwd = this.cwd;
  }

  if (this.env) {
    opts.env = this.env;
  }

  debug(
    'command: %s %s in %s',
    command,
    args.join(' '),
    this.cwd
  );
  var mocha = spawn(command, args, opts);

  var stdout = '', stderr = '';
  mocha.stdout.on('data', function (data) {
    stdout += data;
  });

  mocha.stderr.on('data', function (data) {
    stderr += data;
  });

  mocha.on('error', function (error) {
    console.error('error: ' + error);
  });

  mocha.on('exit', function () {
    var results = { passing: 0, pending: 0, failing: 0, failures: [] };

    // Parse mocha epilogue.
    [ 'passing', 'pending', 'failing' ].forEach(function (resultType) {
      var regex = new RegExp('(\\d+) ' + resultType);
      var match = regex.exec(stdout);
      var count = match === null ? 0 : parseInt(match[1]);
      results[resultType] = count;
      debug('command - %d %s', count, resultType);
    });

    if (0 < results.failing) {
      results.failures.push(stdout);
    }

    this.emit('results', results);
    this.work();
  }.bind(this));
};
