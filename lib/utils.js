import Conf from "conf";
import GroupDoesNotExistError from "./GroupDoesNotExistError.js";

const buildGroupNotFoundError = (group) => {
  return new GroupDoesNotExistError(`Group "${group}" does not exist`);
};

const getConfig = () => {
  return new Conf({
    projectName: "commandsManager",
  });
};

export { buildGroupNotFoundError, getConfig };
