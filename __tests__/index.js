import Conf from "conf";
import consola from "consola";
import Manager from "../";
import GroupDoesNotExistError from "../lib/GroupDoesNotExistError";

jest.mock("Conf", () => jest.fn());

consola.pauseLogs();

const mockGet = jest.fn().mockImplementation(() => []);
let mockSet = jest.fn();
const mockHas = jest.fn().mockImplementation(() => true);

let manager;

beforeAll(() => {
  Conf.mockImplementation(() => ({
    set: mockSet,
    get: mockGet,
    has: mockHas,
  }));
  manager = new Manager();
});

describe("addCommandToGroup", () => {
  it("registers a new command to group", () => {
    manager.addCommandToGroup("echo foo", "group1");
    expect(mockGet).toHaveBeenCalledWith("group1", []);
    expect(mockSet).toHaveBeenCalledWith("group1", [
      { command: "echo foo", priority: 1 },
    ]);
  });

  it("registers new command with specified priority", () => {
    manager.addCommandToGroup("echo bar", "group1", { priority: 4 });
    expect(mockGet).toHaveBeenCalledWith("group1", []);
    expect(mockSet).toHaveBeenCalledWith("group1", [
      { command: "echo bar", priority: 4 },
    ]);
  });
});

describe("removeCommandFromGroup", () => {
  afterEach(() => {
    mockSet.mockClear();
  });

  describe("when both group and command in the group exists", () => {
    const commandObjThatRemains = { command: "prevCommand2 bar", priority: 1 };
    const commandGoingToBeDeleted = "prevCommand1 foo";

    it("removes command from a group", () => {
      mockGet.mockImplementation(() => [
        { command: commandGoingToBeDeleted, priority: 1 },
        commandObjThatRemains,
      ]);
      manager.removeCommandFromGroup(commandGoingToBeDeleted, "group1");
      expect(mockSet).toHaveBeenCalledWith("group1", [commandObjThatRemains]);
    });
  });

  describe("when group exists but command does not exist in this group", () => {
    it("removes command from a group", () => {
      mockGet.mockImplementation(() => [
        { command: "existingCommand foo", priority: 1 },
      ]);
      manager.removeCommandFromGroup("nonexistentCommand bar", "group1");
      expect(mockSet).not.toHaveBeenCalled();
    });
  });

  describe("when group does not exist", () => {
    let wrongGroup;

    beforeAll(() => {
      wrongGroup = "wrongGroup";
      mockHas.mockImplementation((key) => {
        if (key === wrongGroup) {
          return false;
        }
        return true;
      });
    });

    it("throws an exception", () => {
      expect.assertions(1);

      expect(() =>
        manager.removeCommandFromGroup("echo bar", wrongGroup)
      ).toThrow(GroupDoesNotExistError, 'Group "wrongGroup" does not exist');
    });
  });
});

describe("view", () => {
  const group = "foo";

  it("returns registered items for a group", () => {
    mockGet.mockImplementation((key) => {
      if (key === group) {
        return "bar";
      }
    });

    const result = manager.view(group);
    expect(mockGet).toHaveBeenCalledWith(group);
    expect(result).toEqual("bar");
  });
});

describe("viewAll", () => {
  let mockGetResult = [
    { command: "bar", priority: 2 },
    { command: "baz", priority: 1 },
  ];
  it("returns registered items for a group", () => {
    mockGet.mockImplementation(() => {
      return mockGetResult;
    });

    const result = manager.viewAll();
    expect(mockGet).toHaveBeenCalledWith();
    expect(result).toEqual(mockGetResult);
  });
});
