class GroupDoesNotExistError extends Error {
  constructor(message) {
    super(message);
  }
}

export default GroupDoesNotExistError;
