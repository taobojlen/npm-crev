# crev

Code REView for npm

<!-- [![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io) -->
<!-- [![Version](https://img.shields.io/npm/v/crev.svg)](https://npmjs.org/package/crev) -->

[![CircleCI](https://circleci.com/gh/taobojlen/npm-crev/tree/main.svg?style=shield)](https://circleci.com/gh/taobojlen/npm-crev/tree/main)
[![codecov](https://codecov.io/gh/taobojlen/npm-crev/branch/main/graph/badge.svg?token=QBVJOOTP0M)](https://codecov.io/gh/taobojlen/npm-crev)

<!-- [![Downloads/week](https://img.shields.io/npm/dw/crev.svg)](https://npmjs.org/package/crev) -->
<!-- [![License](https://img.shields.io/npm/l/crev.svg)](https://github.com/taobojlen/npm-crev/blob/master/package.json) -->

<!-- toc -->
* [crev](#crev)
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
* [`crev fetch`](#crev-fetch)
* [`crev help [COMMAND]`](#crev-help-command)
* [`crev verify`](#crev-verify)

## `crev fetch`

fetch remote proofs

```
USAGE
  $ crev fetch

OPTIONS
  -h, --help  show CLI help
  --update    update proofs from trusted users
  --url=url   URl of a git repo
```

_See code: [src/commands/fetch.ts](https://github.com/taobojlen/npm-crev/blob/v0.0.0/src/commands/fetch.ts)_

## `crev help [COMMAND]`

display help for crev

```
USAGE
  $ crev help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.0/src/commands/help.ts)_

## `crev verify`

verify the trust levels of dependencies in the current project

```
USAGE
  $ crev verify

OPTIONS
  -h, --help    show CLI help
  --clearCache
```

_See code: [src/commands/verify.ts](https://github.com/taobojlen/npm-crev/blob/v0.0.0/src/commands/verify.ts)_
<!-- commandsstop -->
