'use strict';
var libxmljs = require('libxmljs');
var parallelizer = require('../lib/parallelizer');
var fmt = require('util').format;

var m = {
  tests: [],
  passes: [],
  pending: [],
  failures: [],
  starttime: null,
  totalTasks: 0,

  init: function (totalTasks) {
    m.startTime = new Date();
    m.totalTasks = totalTasks;
    process.stderr.write('\n');
  },

  progress: function (result) {
    Array.prototype.push.apply(m.tests, result.tests);
    Array.prototype.push.apply(m.passes, result.passes);
    Array.prototype.push.apply(m.pending, result.pending);
    Array.prototype.push.apply(m.failures, result.failures);

    process.stderr.write(fmt('\r%d (out of %d) task(s) not yet started (%d success, %d failures, %d pending)',
      parallelizer.queue.length, m.totalTasks, m.passes.length, m.failures.length, m.pending.length));
  },

  epilogue: function () {
    var endTime = new Date();
    var doc = libxmljs.Document();
    var testsuite = doc.node('testsuite').attr({
      name: 'Mopar mocha tests',
      tests: m.tests.length,
      failures: m.failures.length,
      errors: m.failures.length,
      skipped: m.pending.length,
      timestamp: endTime.toUTCString(),
      time: (endTime - m.startTime) / 1000
    });

    m.tests.forEach(function (test) {
      var testcase = testsuite.node('testcase').attr({
        classname: test.fullTitle,
        name: test.title,
        time: (test.duration || 0) / 1000
      });

      if (test.err.stack) {
        testcase.node('failure').cdata(test.err.stack);
      }
    });

    process.stdout.write(doc.toString());
  }
};

module.exports = m;
