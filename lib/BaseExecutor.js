import execa from "execa";
import consola from "consola";
import micromatch from "micromatch";
import R from "ramda";
import { getConfig } from "./utils.js";

class BaseExecutor {
  constructor() {
    this._conf = getConfig();
    this._consola = consola;
  }

  async run(cmd) {
    const commandObj = R.find(
      R.propEq("command", cmd),
      this._commandsByPriority
    );
    if (!commandObj) {
      this._consola.warn(
        `Specified command - ${cmd} does not found in registered commands.`
      );
      return;
    }
    await this._exec(commandObj);
  }

  get commands() {
    return R.find(R.propEq("command", cmd), this._commands);
  }

  get _commandsByPriority() {
    return R.sort(R.descend(R.prop("priority")), this._commands);
  }

  get _firstCommandByPriority() {
    return R.head(this._commandsByPriority);
  }

  _isEmpty() {
    return R.isEmpty(this._commands);
  }

  _findPrioritisedCommandByPattern(pattern) {
    return R.find(
      R.propSatisfies((va) => micromatch.every(va, pattern), "command"),
      this._commandsByPriority
    );
  }

  async _exec(commandObj, args = [], options = { stdio: "inherit" }) {
    const aggregatedCmd = R.join(" ", R.flatten([commandObj.command, args]));
    this._consola.info(`Going to execute:`, aggregatedCmd);
    await execa(commandObj.command, args, options);
  }
}

export default BaseExecutor;
