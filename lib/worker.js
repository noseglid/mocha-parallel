'use strict';

var util = require('util');
var EventEmitter = require('events').EventEmitter;
var spawn = require('child_process').spawn;

function Worker(index, opts) {
  EventEmitter.call(this);
  this.debug = require('debug')('worker:' + index);

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
  args.push('--reporter', 'json');

  // Execute test case.
  var opts = {};
  if (this.cwd) {
    opts.cwd = this.cwd;
  }

  if (this.env) {
    opts.env = this.env;
  }

  this.debug(
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
    var result = JSON.parse(stdout);

    this.debug('Worker done. %s tests, %s success, %s failed, %s pending',
      result.stats.tests, result.stats.passes, result.stats.failures, result.stats.pending);

    this.emit('results', result);
    this.work();
  }.bind(this));
};
