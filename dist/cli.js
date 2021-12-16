#!/usr/bin/env node
'use strict';

var cac = require('cac');
var consola = require('consola');
var R = require('ramda');
var Conf = require('conf');
var execa = require('execa');
var micromatch = require('micromatch');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var cac__default = /*#__PURE__*/_interopDefaultLegacy(cac);
var consola__default = /*#__PURE__*/_interopDefaultLegacy(consola);
var R__default = /*#__PURE__*/_interopDefaultLegacy(R);
var Conf__default = /*#__PURE__*/_interopDefaultLegacy(Conf);
var execa__default = /*#__PURE__*/_interopDefaultLegacy(execa);
var micromatch__default = /*#__PURE__*/_interopDefaultLegacy(micromatch);

class GroupDoesNotExistError extends Error {
  constructor(message) {
    super(message);
  }

}

const buildGroupNotFoundError = group => {
  return new GroupDoesNotExistError(`Group "${group}" does not exist`);
};

const getConfig = () => {
  return new Conf__default["default"]({
    projectName: "commandsManager"
  });
};

class Manager {
  constructor() {
    this.conf = getConfig();
  }

  addCommandToGroup(command, group, options = {}) {
    const items = this.conf.get(group, []);
    const {
      priority = 1
    } = options;
    items.push({
      command,
      priority
    });
    this.conf.set(group, items);
  }

  removeCommandFromGroup(command, group) {
    this._ensureGroupExists(group);

    const groupData = this.conf.get(group, []);
    const newData = R__default["default"].reject(R__default["default"].propEq("command", command), groupData);

    if (R__default["default"].eqBy(R__default["default"].length, newData, groupData)) {
      consola__default["default"].info(`Command "${command}" was not found in the registry.`);
      return;
    }

    this.conf.set(group, newData);
  }

  view(group) {
    this._ensureGroupExists(group);

    return this.conf.get(group);
  }

  viewAll() {
    return this.conf.get();
  }

  _ensureGroupExists(group) {
    if (!this.conf.has(group)) {
      throw buildGroupNotFoundError(group);
    }
  }

}

class BaseExecutor {
  constructor() {
    this._conf = getConfig();
    this._consola = consola__default["default"];
  }

  async run(cmd) {
    const commandObj = R__default["default"].find(R__default["default"].propEq("command", cmd), this._commandsByPriority);

    if (!commandObj) {
      this._consola.warn(`Specified command - ${cmd} does not found in registered commands.`);

      return;
    }

    await this._exec(commandObj);
  }

  get commands() {
    return R__default["default"].find(R__default["default"].propEq("command", cmd), this._commands);
  }

  get _commandsByPriority() {
    return R__default["default"].sort(R__default["default"].descend(R__default["default"].prop("priority")), this._commands);
  }

  get _firstCommandByPriority() {
    return R__default["default"].head(this._commandsByPriority);
  }

  _isEmpty() {
    return R__default["default"].isEmpty(this._commands);
  }

  _findPrioritisedCommandByPattern(pattern) {
    return R__default["default"].find(R__default["default"].propSatisfies(va => micromatch__default["default"].every(va, pattern), "command"), this._commandsByPriority);
  }

  async _exec(commandObj, args = [], options = {
    stdio: "inherit"
  }) {
    const aggregatedCmd = R__default["default"].join(" ", R__default["default"].flatten([commandObj.command, args]));

    this._consola.info(`Going to execute:`, aggregatedCmd);

    await execa__default["default"](commandObj.command, args, options);
  }

}

class Executor extends BaseExecutor {
  constructor(group) {
    super();

    if (!this._conf.has(group)) {
      throw buildGroupNotFoundError(group);
    }

    this._group = group;
    this._commands = this._conf.get(this._group);
  }

  async runFirst() {
    if (this._isEmpty()) {
      consola__default["default"].info(`There is no registered commands for the "${this.group}" group.`);
      return;
    }

    await this._exec(this._firstCommandByPriority);
  }

  async runByPattern(pattern) {
    const commandObj = this._findPrioritisedCommandByPattern(pattern);

    if (!commandObj) {
      this._consola.info(`There is no registered commands matching the "${pattern}" pattern in "${this._group}" group.`);

      return;
    }

    await this._exec(commandObj);
  }

}

class UngroupedExecutor extends BaseExecutor {
  constructor() {
    super();
    this._commands = R__default["default"].flatten(R__default["default"].values(this._conf.get()));
  }

  async runFirst() {
    if (this._isEmpty()) {
      this._consola.info("There is no commands in the registry yet.");

      return;
    }

    await this._exec(this._firstCommandByPriority);
  }

  async runByPattern(pattern) {
    const commandObj = this._findPrioritisedCommandByPattern(pattern);

    if (!commandObj) {
      this._consola.info(`Specified pattern - ${pattern} does not found in registered commands.`);

      return;
    }

    await this._exec(commandObj);
  }

}

const cli = cac__default["default"]();
const defaultGroup = "MyCommands";
const manager = new Manager();
cli.command("addcmd <cmd>", "Add a command to specified group (or default group)").option("-g, --group <group>", "A group where command should be added to", {
  default: defaultGroup
}).option("-p, --priority [priority]", "Priority for a command").action((cmd, options) => {
  const extraOptions = R__default["default"].pick("priority", options);
  manager.addCommandToGroup(cmd, options.group, extraOptions);
  consola__default["default"].success(`A command "${cmd}" was added to the "${options.group}" group.`);
});
cli.command("remcmd <cmd>", "Remove a command from specified group (or default group)").option("-g, --group <group>", "A group from which the command should be removed", {
  default: defaultGroup
}).action((cmd, options) => {
  manager.removeCommandFromGroup(cmd, options.group);
  consola__default["default"].success(`A command "${command}" was deleted from the "${group}" group.`);
});
cli.command("view", "View commands for the specified or default group").option("-g, --group <group>", "A group in which commands should be viewed", {
  default: defaultGroup
}).action(options => {
  const {
    group
  } = options;
  const commands = manager.view(group);
  consola__default["default"].success(`Commands registered in the "${group}" group:\n`, commands);
});
cli.command("viewAll", "View commands in all groups").alias("viewall").action(() => {
  const allCommands = manager.viewAll();
  consola__default["default"].success("All commands:\n", allCommands);
});
cli.command("exec", "Execute a command matching specified params - `cmd` or `pattern` (a command with higher priority value will take precedence). If you don't provide neither `cmd` or `pattern` option a registered command with higher prioriry will be executed.").option("-g, --group <group>", "A group from which commands should be retrieved").option("-c, --cmd [cmd]", "Command to be executed").option("-t, --pattern [pattern]", "Execute a command by pattern (for example `npm t*`).").action(async options => {
  let executor;
  console.log("PATT IS ", options.pattern);

  if (options.cmd && options.pattern) {
    throw new Error("`cmd` and `pattern` options are mutually exclusive. Please provide either `cmd` or `pattern` (or none).");
  }

  const {
    group
  } = options;

  if (group) {
    executor = new Executor(group);
  } else {
    executor = new UngroupedExecutor();
  }

  if (options.cmd) {
    await executor.run(options.cmd);
  } else if (options.pattern) {
    await executor.runByPattern(options.pattern);
  } else {
    await executor.runFirst();
  }
});
cli.help();
cli.parse();
