'use strict';

var Worker = require('./worker');

var parallelizer = {
  workerList: null,
  queue: null,
  total: 0,
  completeCount: 0,
  failures: 0,

  parallelize: function (queue, opts) {
    var workerList = [];
    parallelizer.workerList = workerList;
    parallelizer.queue = queue;
    parallelizer.total = queue.length;
    parallelizer.reporter = opts.reporter;

    for (var i = 0; i < opts.parallel; i++) {
      var worker = new Worker(i, opts);
      worker.queue = queue;
      worker.on('results', parallelizer.reporter.progress);
      worker.on('results', parallelizer.onresults);
      worker.once('complete', parallelizer.oncomplete);
      workerList.push(worker);
    }

    workerList.forEach(function (worker) {
      worker.work();
    });
  },

  onresults: function (result) {
    parallelizer.failures += result.stats.failures;
  },

  oncomplete: function (event) {
    if (++parallelizer.completeCount !== parallelizer.workerList.length) {
      return;
    }

    parallelizer.reporter.epilogue();
    process.exit(Math.min(1, parallelizer.failures));
  }
};

module.exports = parallelizer;
