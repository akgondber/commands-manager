import R from "ramda";
import consola from "consola";

import { buildGroupNotFoundError, getConfig } from "./lib/utils.js";

class Manager {
  constructor() {
    this.conf = getConfig();
  }

  addCommandToGroup(command, group, options = {}) {
    const items = this.conf.get(group, []);
    const { priority = 1 } = options;
    items.push({
      command,
      priority,
    });
    this.conf.set(group, items);
  }

  removeCommandFromGroup(command, group) {
    this._ensureGroupExists(group);
    const groupData = this.conf.get(group, []);
    const newData = R.reject(R.propEq("command", command), groupData);

    if (R.eqBy(R.length, newData, groupData)) {
      consola.info(`Command "${command}" was not found in the registry.`);
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

export default Manager;
