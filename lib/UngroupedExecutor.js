import R from "ramda";

import BaseExecutor from "./BaseExecutor.js";

class UngroupedExecutor extends BaseExecutor {
  constructor() {
    super();
    this._commands = R.flatten(R.values(this._conf.get()));
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
      this._consola.info(
        `Specified pattern - ${pattern} does not found in registered commands.`
      );
      return;
    }
    await this._exec(commandObj);
  }
}

export default UngroupedExecutor;
