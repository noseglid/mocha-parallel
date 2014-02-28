var Worker = require('./worker'),
    colors = require('colors'),
    fmt = require('util').format,
    os = require('os'),
    resultColor = require('./result_color');


parallelizer = {
  passing: 0,

  pending: 0,

  failing: 0,

  failures: [],

  parallelize: function(queue) {
    var concurrency = 2 * os.cpus().length;
    var workerList = [];
    for (var i = 0; i < concurrency; i++) {
      var worker = new Worker();
      worker.queue = queue;
      worker.on('results', parallelizer.tally);
      worker.on('results', parallelizer.report);
      worker.once('complete', parallelizer.oncomplete);
      workerList.push(worker);
    }

    workerList.forEach(function(worker) {
      worker.work();
    });

    process.stdout.write('\n' + '  ');
  },

  tally: function(event) {
    parallelizer.passing += event.passing;
    parallelizer.pending += event.pending;
    parallelizer.failing += event.failing;
    parallelizer.failures = parallelizer.failures.concat(event.failures);
  },

  report: function(event) {
    [
      'passing',
      'pending',
      'failing'
    ].forEach(function(resultType) {
      var color = resultColor[resultType];
      process.stdout.write(repeat('.'[color], event[resultType]));
    });
  },

  oncomplete: function(event) {
    parallelizer.failures.forEach(function(failure) {
      console.error(failure);
    });

    parallelizer.epilogue();
    process.exit(Math.min(1, parallelizer.failures));
  },

  epilogue: function() {
    [
      'passing',
      'pending',
      'failing'
    ].forEach(function(resultType) {
      var output = fmt('  %d %s', parallelizer[resultType], resultType);
      var colored = output[resultColor[resultType]];
      console.log(colored);
    });
  }
};
module.exports = parallelizer;


function repeat(str, n) {
  return new Array(n + 1).join(str);
}
