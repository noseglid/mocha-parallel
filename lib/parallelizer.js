'use strict';

var Worker = require('./worker');
var resultColors = require('./resultColors');
var fmt = require('util').format;
require('colors');

function repeat(str, n) {
  return new Array(n + 1).join(str);
}

var parallelizer = {
  passing: 0,
  pending: 0,
  failing: 0,
  failures: [],
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
      process.stdout.columns - parallelizer.padding.length - 2 * ('' + queue.length).length - 20, 80);
    for (var i = 0; i < opts.parallel; i++) {
      var worker = new Worker(opts);
      worker.queue = queue;
      worker.on('results', parallelizer.tally);
      worker.on('results', parallelizer.report);
      worker.once('complete', parallelizer.oncomplete);
      workerList.push(worker);
    }

    process.stdout.write(parallelizer.padding);
    workerList.forEach(function (worker) {
      worker.work();
    });
  },

  tally: function (event) {
    [ 'passing', 'pending', 'failing' ].forEach(function (resultType) {
      parallelizer[resultType] += event[resultType];
    });

    parallelizer.failures = parallelizer.failures.concat(event.failures);
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

  report: function (event) {
    [ 'passing', 'pending', 'failing' ].forEach(function (resultType) {
      var n = Math.min(parallelizer.maxColumns - parallelizer.column, event[resultType]);
      var remaining = event[resultType] - n;

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

    parallelizer.failures.forEach(function (failure) {
      console.error(failure);
    });

    parallelizer.epilogue();
    process.exit(Math.min(1, parallelizer.failures));
  },

  epilogue: function () {
    process.stdout.write('\n');
    [ 'passing', 'pending', 'failing' ].forEach(function (resultType) {
      console.log('  %d %s'[resultColors[resultType]], parallelizer[resultType], resultType);
    });
  }
};

module.exports = parallelizer;
