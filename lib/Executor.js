import consola from "consola";
import BaseExecutor from "./BaseExecutor.js";
import { buildGroupNotFoundError } from "./utils.js";

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
      consola.info(
        `There is no registered commands for the "${this.group}" group.`
      );
      return;
    }

    await this._exec(this._firstCommandByPriority);
  }

  async runByPattern(pattern) {
    const commandObj = this._findPrioritisedCommandByPattern(pattern);

    if (!commandObj) {
      this._consola.info(
        `There is no registered commands matching the "${pattern}" pattern in "${this._group}" group.`
      );
      return;
    }

    await this._exec(commandObj);
  }
}

export default Executor;
