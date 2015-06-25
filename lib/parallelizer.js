'use strict';

var Worker = require('./worker');
var resultColors = require('./resultColors');
var fmt = require('util').format;
require('colors');

function repeat(str, n) {
  return new Array(n + 1).join(str);
}

var parallelizer = {
  results: [],
  workerList: null,
  queue: null,
  total: 0,
  completeCount: 0,
  column: 0,
  maxColumns: 0,
  padding: '    ',

  parallelize: function (queue, opts) {
    var workerList = [];
    parallelizer.workerList = workerList;
    parallelizer.queue = queue;
    parallelizer.total = queue.length;
    parallelizer.maxColumns = Math.min(
      (process.stdout.columns || 80) - parallelizer.padding.length - 2 * ('' + queue.length).length - 20, 80
    );
    for (var i = 0; i < opts.parallel; i++) {
      var worker = new Worker(i, opts);
      worker.queue = queue;
      worker.on('results', parallelizer.report.bind(this));
      worker.once('complete', parallelizer.oncomplete.bind(this));
      workerList.push(worker);
    }

    process.stdout.write(parallelizer.padding);
    workerList.forEach(function (worker) {
      worker.work();
    });
  },

  printDots: function (color, n) {
    parallelizer.column += n;
    process.stdout.write(repeat('.'[color], n));
  },

  printProgress: function () {
    process.stdout.write(fmt(' Tests: %d/%d (%d %)\n' + parallelizer.padding,
      parallelizer.total - parallelizer.queue.length,
      parallelizer.total,
      Math.floor(100 * (parallelizer.total - parallelizer.queue.length) / parallelizer.total)));
  },

  report: function (result) {
    parallelizer.results.push(result);
    [ 'passes', 'pending', 'failures' ].forEach(function (resultType) {
      var n = Math.min(parallelizer.maxColumns - parallelizer.column, result.stats[resultType]);
      var remaining = result.stats[resultType] - n;

      parallelizer.printDots(resultColors[resultType], n);

      if (parallelizer.column === parallelizer.maxColumns ) {
        parallelizer.printProgress();
        parallelizer.column = 0;
      }

      parallelizer.printDots(resultColors[resultType], remaining);

    }.bind(parallelizer));

  },

  oncomplete: function (event) {
    if (++parallelizer.completeCount !== parallelizer.workerList.length) {
      return;
    }

    process.stdout.write(repeat(' ', parallelizer.maxColumns - parallelizer.column));
    parallelizer.printProgress();

    parallelizer.results.forEach(function (result) {
      result.failures.forEach(function (failure) {
        process.stdout.write('\n\n');
        process.stdout.write(parallelizer.padding + ('Failure: ' + failure.fullTitle).red + '\n');
        process.stdout.write(parallelizer.padding + failure.err.message + '\n\n');
        process.stdout.write(parallelizer.padding + failure.err.stack.replace(/\n/g, '\n' + parallelizer.padding, 1) + '\n');
      });
    });

    parallelizer.epilogue();
    process.exit(Math.min(1, parallelizer.failures));
  },

  epilogue: function () {
    process.stdout.write('\n');
    var passing = 0, failures = 0, pending = 0;
    parallelizer.results.forEach(function (result) {
      passing += result.stats.passes;
      failures += result.stats.failures;
      pending += result.stats.pending;
    });

    process.stdout.write(parallelizer.padding + (passing + ' passing')[resultColors['passes']] + '\n');
    process.stdout.write(parallelizer.padding + (pending + ' pending')[resultColors['pending']] + '\n');
    process.stdout.write(parallelizer.padding + (failures + ' failing')[resultColors['failures']] + '\n');
  }
};

module.exports = parallelizer;
