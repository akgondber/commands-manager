#!/usr/bin/env node
import cac from "cac";
import consola from "consola";
import R from "ramda";
import Manager from "./index.js";
import Executor from "./lib/Executor.js";
import UngroupedExecutor from "./lib/UngroupedExecutor.js";

const cli = cac();

const defaultGroup = "MyCommands";

const manager = new Manager();

cli
  .command(
    "addcmd <cmd>",
    "Add a command to specified group (or default group)"
  )
  .option("-g, --group <group>", "A group where command should be added to", {
    default: defaultGroup,
  })
  .option("-p, --priority [priority]", "Priority for a command")
  .action((cmd, options) => {
    const extraOptions = R.pick(["priority"], options);
    manager.addCommandToGroup(cmd, options.group, extraOptions);
    consola.success(
      `A command "${cmd}" was added to the "${options.group}" group.`
    );
  });

cli
  .command(
    "remcmd <cmd>",
    "Remove a command from specified group (or default group)"
  )
  .option(
    "-g, --group <group>",
    "A group from which the command should be removed",
    {
      default: defaultGroup,
    }
  )
  .action((cmd, options) => {
    manager.removeCommandFromGroup(cmd, options.group);
    consola.success(
      `A command "${command}" was deleted from the "${group}" group.`
    );
  });

cli
  .command("view", "View commands for the specified or default group")
  .option("-g, --group <group>", "A group in which commands should be viewed", {
    default: defaultGroup,
  })
  .action((options) => {
    const { group } = options;
    const commands = manager.view(group);

    consola.success(`Commands registered in the "${group}" group:\n`, commands);
  });

cli
  .command("viewAll", "View commands in all groups")
  .alias("viewall")
  .action(() => {
    const allCommands = manager.viewAll();
    consola.success("All commands:\n", allCommands);
  });

cli
  .command(
    "exec",
    "Execute a command matching specified params - `cmd` or `pattern` (a command with higher priority value will take precedence). If you don't provide neither `cmd` or `pattern` option a registered command with higher prioriry will be executed."
  )
  .option(
    "-g, --group <group>",
    "A group from which commands should be retrieved"
  )
  .option("-c, --cmd [cmd]", "Command to be executed")
  .option(
    "-t, --pattern [pattern]",
    "Execute a command by pattern (for example `npm t*`)."
  )
  .action(async (options) => {
    let executor;

    if (options.cmd && options.pattern) {
      throw new Error(
        "`cmd` and `pattern` options are mutually exclusive. Please provide either `cmd` or `pattern` (or none)."
      );
    }

    const { group } = options;

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
