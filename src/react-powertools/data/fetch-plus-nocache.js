export default () => request => {
  if (request && request.options) {
    if (!request.options.query) {
      request.options.query = {};
    }
    request.options.query = {...request.options.query};
    request.options.query.nocache = Date.now();
  }
};
