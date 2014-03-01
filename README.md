# parallel-mocha


[![Build Status](https://travis-ci.org/gaye/parallel-mocha.png?branch=master)](https://travis-ci.org/gaye/parallel-mocha)

### Usage

```
  Usage: parallel-mocha \
             --cwd /path/to/cwd \
             --env "FOO=bar BAR=baz" \
             --format "some mocha command %s" \
             --tasks "one_test.js two_test.js three_test.js"

  Options:

    -h, --help             output usage information
    -V, --version          output the version number
    -c, --cwd [cwd]        directory to execute tasks
    -e, --env [env]        environment variables
    -f, --format [format]  template for tasks
    -t, --tasks [tasks]    list of tasks

```
