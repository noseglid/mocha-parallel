'use strict';
var libxmljs = require('libxmljs');

var m = {
  tests: [],
  starttime: null,

  init: function () {
    m.startTime = new Date();
  },

  progress: function (result) {
    Array.prototype.push.apply(m.tests, result.tests);
  },

  epilogue: function () {
    var endTime = new Date();
    var doc = libxmljs.Document();
    var testsuite = doc.node('testsuite').attr({
      name: 'Mocha tests',
      tests: 0,
      failures: 0,
      errors: 0,
      skipped: 0,
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
