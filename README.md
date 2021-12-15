# commands-manager [![NPM version][npm-image]][npm-url]

> Brings the command line experience to the new level by grouping and running commands like a boss.

## Installation

```sh
$ npm install --global commands-manager
```

or

```sh
$ yarn global add commands-manager
```

After installing this package globally you will have the main `commandsmanager` command as well as its handy aliases: `comgr` and `cmgr`.

### Commands

Available commands are described below.

#### addcmd

Usage:
$ cmgr addcmd <cmd>

Add a command to specified group (or default group).

Options:
-g, --group <group> A group where command should be added to (default: MyCommands)
-p, --priority [priority] Priority for a command
-h, --help Display this message

#### remcmd

Usage:
$ cmgr remcmd <cmd>

Remove a command from specified group (or default group).

Options:
-g, --group <group> A group from which the command should be removed (default: MyCommands)
-h, --help Display this message

#### view

Usage:
$ cmgr view

View commands for the specified or default group

Options:
-g, --group <group> A group in which commands should be viewed (default: MyCommands)
-h, --help Display this message

#### viewAll

Usage:
$ cmgr viewAll

View commands in all groups.

Options:
-h, --help Display this message

#### exec

Usage:
$ cmgr exec

Execute a command by specified params (command or pattern).

Options:
-g, --group <group> A group from which commands should be retrieved
-c, --cmd [cmd] Command to be executed
-t, --pattern [pattern] Execute a command by pattern
-h, --help Display this message

## License

MIT © [Rushan Alyautdinov](https://github.com/akgondber)


[npm-image]: https://badge.fury.io/js/commands-manager.svg
[npm-url]: https://npmjs.org/package/commands-manager
