import Conf from "conf";
import execa from "execa";
import consola from "consola";

import Executor from "../../lib/Executor";

jest.mock("Conf", () => jest.fn());
jest.mock("execa", () => jest.fn());

consola.pauseLogs();

const mockGet = jest.fn().mockImplementation(() => []);
let mockSet = jest.fn();
const mockHas = jest.fn().mockImplementation(() => true);

const group = "myGroup";
const lowPriorityCommand = { command: "lowPriCmd", priority: 1 };
const mediumPriorityCommand = { command: "medPriCmd", priority: 3 };
const mediumPriorityCommandTwo = { command: "medPriCmdTwo", priority: 3 };
const highPriorityCommand = { command: "higPriCmd", priority: 5 };

let executor;

beforeAll(() => {
  Conf.mockImplementation(() => ({
    get: mockGet,
    set: mockSet,
    has: mockHas,
  }));
  mockGet.mockImplementation((key) => {
    return [
      lowPriorityCommand,
      mediumPriorityCommand,
      mediumPriorityCommandTwo,
      highPriorityCommand,
    ];
  });
  executor = new Executor(group);
});

afterEach(() => {
  execa.mockClear();
});

describe("run", () => {
  describe("when specified command is present", () => {
    it("calls execa", async () => {
      await executor.run(mediumPriorityCommand.command);
      expect(execa).toHaveBeenCalledWith(mediumPriorityCommand.command, [], {
        stdio: "inherit",
      });
    });
  });

  describe("when specified command is missing", () => {
    it("does not call execa", async () => {
      await executor.run("nonExistentCommand");
      expect(execa).not.toHaveBeenCalled();
    });
  });
});

describe("runFirst", () => {
  it("executes registered command with higher priority", async () => {
    await executor.runFirst();
    expect(execa).toHaveBeenCalledWith(highPriorityCommand.command, [], {
      stdio: "inherit",
    });
  });
});

describe("runByPattern", () => {
  describe("using single pattern", () => {
    it("executes appropriate registered command", async () => {
      await executor.runByPattern("*medPri*");
      expect(execa).toHaveBeenCalledWith(mediumPriorityCommand.command, [], {
        stdio: "inherit",
      });
    });
  });

  describe("using multiple patterns", () => {
    it("executes appropriate registered command matching all patterns", async () => {
      await executor.runByPattern(["*medPri*", "*Two"]);
      expect(execa).toHaveBeenCalledWith(mediumPriorityCommandTwo.command, [], {
        stdio: "inherit",
      });
    });
  });

  describe("when pattern does not match registered commands", () => {
    it("does not call execa", async () => {
      await executor.runByPattern(
        "*patternThatDoesNotMatchAnyRegisteredCommands*"
      );
      expect(execa).not.toHaveBeenCalled();
    });
  });
});
