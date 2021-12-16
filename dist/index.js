'use strict';

var R = require('ramda');
var consola = require('consola');
var Conf = require('conf');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var R__default = /*#__PURE__*/_interopDefaultLegacy(R);
var consola__default = /*#__PURE__*/_interopDefaultLegacy(consola);
var Conf__default = /*#__PURE__*/_interopDefaultLegacy(Conf);

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

module.exports = Manager;
