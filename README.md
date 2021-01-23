# crev

Distributed **c**ode **rev**iew for npm

<!-- [![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io) -->
<!-- [![Version](https://img.shields.io/npm/v/crev.svg)](https://npmjs.org/package/crev) -->

[![GitLab CI](https://gitlab.com/tao_oat/npm-crev/badges/main/pipeline.svg)](https://gitlab.com/tao_oat/npm-crev/-/commits/main)
[![codecov](https://codecov.io/gl/tao_oat/npm-crev/branch/main/graph/badge.svg?token=R0XUW8HM0W)](https://codecov.io/gl/tao_oat/npm-crev)

<!-- [![Downloads/week](https://img.shields.io/npm/dw/crev.svg)](https://npmjs.org/package/crev) -->
<!-- [![License](https://img.shields.io/npm/l/crev.svg)](https://github.com/taobojlen/npm-crev/blob/master/package.json) -->

<!-- toc -->
* [crev](#crev)
* [Introduction](#introduction)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->

# Introduction

`npm-crev` is an implementation of the [crev](https://github.com/crev-dev/crev/) distributed code review system for the npm ecosystem.

> Crev is scalable, distributed, and social. Users publish and circulate results of their reviews: potentially warning about problems, malicious code, or just encouraging high quality by peer review.
>
> Crev allows building a personal web of trust in other people and the code they use and review.

npm-crev is far from done, but under active development. **It has not been audited for security**.

## To do:

- [x] Generating IDs
- [x] Fetching repos
- [x] Trusting others
- [x] Reviewing packages
- [ ] Integration tests of commands
- [ ] Pushing proof repos
- [ ] Support for npm <7 and yarn
- [ ] Customization of verification parameters (what does trust mean to you?)
- [ ] Go through TODOs in code

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
* [`crev id:create`](#crev-idcreate)
* [`crev id:list`](#crev-idlist)
* [`crev id:trust IDS`](#crev-idtrust-ids)
* [`crev id:use [ID]`](#crev-iduse-id)
* [`crev review [PACKAGE]`](#crev-review-package)
* [`crev verify [LOCKFILE]`](#crev-verify-lockfile)

## `crev fetch`

fetch proofs from other users

```
USAGE
  $ crev fetch

OPTIONS
  -h, --help  show CLI help
  --all       fetch all repos we know of
  --update    update proofs from trusted users
  --url=url   URL of a git repo
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

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.1/src/commands/help.ts)_

## `crev id:create`

create a new crev ID

```
USAGE
  $ crev id:create

OPTIONS
  -h, --help                   show CLI help
  -p, --passphrase=passphrase  passphrase to encrypt your private key
  -u, --url=url                URL of the associated Git repo
```

_See code: [src/commands/id/create.ts](https://github.com/taobojlen/npm-crev/blob/v0.0.0/src/commands/id/create.ts)_

## `crev id:list`

list crev IDs

```
USAGE
  $ crev id:list

OPTIONS
  -a, --all               list all known crev IDs
  -h, --help              show CLI help
  -x, --extended          show extra columns
  --columns=columns       only show provided columns (comma-separated)
  --csv                   output is csv format [alias: --output=csv]
  --filter=filter         filter property by partial string matching, ex: name=foo
  --no-header             hide table header from output
  --no-truncate           do not truncate output to fit screen
  --output=csv|json|yaml  output in a more machine friendly format
  --sort=sort             property to sort by (prepend '-' for descending)

ALIASES
  $ crev id:show
```

_See code: [src/commands/id/list.ts](https://github.com/taobojlen/npm-crev/blob/v0.0.0/src/commands/id/list.ts)_

## `crev id:trust IDS`

publicly trust another crev ID

```
USAGE
  $ crev id:trust IDS

ARGUMENTS
  IDS  comma-separated list of IDs to trust

OPTIONS
  -h, --help  show CLI help
```

_See code: [src/commands/id/trust.ts](https://github.com/taobojlen/npm-crev/blob/v0.0.0/src/commands/id/trust.ts)_

## `crev id:use [ID]`

switch the current crev ID

```
USAGE
  $ crev id:use [ID]

OPTIONS
  -h, --help  show CLI help
```

_See code: [src/commands/id/use.ts](https://github.com/taobojlen/npm-crev/blob/v0.0.0/src/commands/id/use.ts)_

## `crev review [PACKAGE]`

review a package

```
USAGE
  $ crev review [PACKAGE]

ARGUMENTS
  PACKAGE  the name of the package to review

OPTIONS
  -h, --help             show CLI help
  -v, --version=version  the version to review
```

_See code: [src/commands/review.ts](https://github.com/taobojlen/npm-crev/blob/v0.0.0/src/commands/review.ts)_

## `crev verify [LOCKFILE]`

verify your project's dependencies

```
USAGE
  $ crev verify [LOCKFILE]

ARGUMENTS
  LOCKFILE  path to a npm lockfile

OPTIONS
  -h, --help  show CLI help
```

_See code: [src/commands/verify.ts](https://github.com/taobojlen/npm-crev/blob/v0.0.0/src/commands/verify.ts)_
<!-- commandsstop -->
