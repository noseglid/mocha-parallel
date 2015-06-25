'use strict';

var fmt = require('util').format;
var parallelizer = require('../lib/parallelizer');
require('colors');

var resultColors = {
  'passes': 'green',
  'pending': 'blue',
  'failures': 'red'
};

function repeat(str, n) {
  return new Array(n + 1).join(str);
}

var r = {
  results: [],
  totalTasks: 0,
  column: 0,
  maxColumns: 0,
  padding: '    ',

  init: function (totalTasks, workerLength) {
    r.totalTasks = totalTasks;
    r.maxColumns = Math.min(
      (process.stdout.columns || 80) - r.padding.length - 2 * ('' + totalTasks).length - 20, 80
    );

    process.stdout.write(fmt('\n%sRunning %d tests with %d parallel jobs\n', r.padding, totalTasks, workerLength));
    process.stdout.write(r.padding); // Initial padding. Padding for other rows are added in `printProgress`
  },

  progress: function (result) {
    r.results.push(result);
    [ 'passes', 'pending', 'failures' ].forEach(function (resultType) {
      var n = Math.min(r.maxColumns - r.column, result.stats[resultType]);
      var remaining = result.stats[resultType] - n;

      r.printDots(resultColors[resultType], n);

      if (r.column === r.maxColumns ) {
        r.printProgress();
        r.column = 0;
      }

      r.printDots(resultColors[resultType], remaining);
    });

  },

  epilogue: function (resultSet) {
    process.stdout.write(repeat(' ', r.maxColumns - r.column));
    r.printProgress();

    r.results.forEach(function (result) {
      result.failures.forEach(function (failure) {
        process.stdout.write('\n\n');
        process.stdout.write(r.padding + ('Failure: ' + failure.fullTitle).red + '\n');
        process.stdout.write(r.padding + failure.err.message + '\n\n');
        process.stdout.write(r.padding + failure.err.stack.replace(/\n/g, '\n' + r.padding, 1) + '\n');
      });
    });

    process.stdout.write('\n');
    var passing = 0, failures = 0, pending = 0;
    r.results.forEach(function (result) {
      passing += result.stats.passes;
      failures += result.stats.failures;
      pending += result.stats.pending;
    });

    process.stdout.write(r.padding + (passing + ' passing')[resultColors['passes']] + '\n');
    process.stdout.write(r.padding + (pending + ' pending')[resultColors['pending']] + '\n');
    process.stdout.write(r.padding + (failures + ' failing')[resultColors['failures']] + '\n');
  },

  printDots: function (color, n) {
    r.column += n;
    process.stdout.write(repeat('.'[color], n));
  },

  printProgress: function () {
    process.stdout.write(fmt(' Tests: %d/%d (%d %)\n' + r.padding,
      r.totalTasks - parallelizer.queue.length,
      r.totalTasks,
      Math.floor(100 * (r.totalTasks - parallelizer.queue.length) / r.totalTasks)));
  }

};

module.exports = r;
