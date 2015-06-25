# mopar

A parallel runner for mocha. See usage example on how to use it

### Usage

```
  Usage: ./mopar \
             --cwd /path/to/cwd \
             --env "FOO=bar BAR=baz" \
             --format "some mocha command %s" \
             --parallel 10 \
             --tasks "one_test.js two_test.js three_test.js"

  Options:

    -h, --help                 output usage information
    -V, --version              output the version number
    -c, --cwd [cwd]            directory to execute tasks
    -e, --env [env]            environment variables
    -f, --format [format]      template for tasks
    -p, --parallel [parallel]  number of parallel tasks
    -t, --tasks [tasks]        list of tasks,
    -r, --reporter [reporter]  the reporter to use. Supports: `dot`, `xunit`.

```

### Debug

  All debug messages are written with the [debug][debug] library.
  To output all information run with environmentvariable `DEBUG=*`.

  [debug]: https://www.npmjs.com/package/debug