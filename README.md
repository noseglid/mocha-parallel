# mopar

A parallel runner for mocha

### Usage

```
  Usage: ./mopar \
             --cwd /path/to/cwd \
             --env "FOO=bar BAR=baz" \
             --format "some mocha command %s" \
             --parallel 10 \
             --tasks "one_test.js two_test.js three_test.js"

  Options:

    -h, --help             output usage information
    -V, --version          output the version number
    -c, --cwd [cwd]        directory to execute tasks
    -e, --env [env]        environment variables
    -f, --format [format]  template for tasks
    -p, --parallel [parallel]  number of parallel tasks
    -t, --tasks [tasks]    list of tasks

```
