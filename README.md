crev
====

Code REView for npm

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/crev.svg)](https://npmjs.org/package/crev)
[![CircleCI](https://circleci.com/gh/taobojlen/npm-crev/tree/master.svg?style=shield)](https://circleci.com/gh/taobojlen/npm-crev/tree/master)
[![Downloads/week](https://img.shields.io/npm/dw/crev.svg)](https://npmjs.org/package/crev)
[![License](https://img.shields.io/npm/l/crev.svg)](https://github.com/taobojlen/npm-crev/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g crev
$ crev COMMAND
running command...
$ crev (-v|--version|version)
crev/0.0.0 linux-x64 node-v15.3.0
$ crev --help [COMMAND]
USAGE
  $ crev COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`crev hello [FILE]`](#crev-hello-file)
* [`crev help [COMMAND]`](#crev-help-command)

## `crev hello [FILE]`

```
USAGE
  $ crev hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ crev hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/hello.ts](https://github.com/taobojlen/npm-crev/blob/v0.0.0/src/commands/hello.ts)_

## `crev help [COMMAND]`

```
USAGE
  $ crev help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.0/src/commands/help.ts)_
<!-- commandsstop -->
