/**
 * fetch-plus middleware that decodes error responses into simple JSON
 * requests
 * @param store
 * @param tokenProperty
 * @returns {*}
 */
export default () => (request) => {
  return {
    after: response => response,
    error: async response => {
      const result = new Error("Error Processing Request");
      result.status = response.status;
      result.statusText = response.statusText;
      result.message = "Error Processing Request";

      try {
        result.body = await response.text();
        if (result.body) {
          // see if it is JSON
          try {
            const json = JSON.parse(result.body);
            if (json) {
              if (typeof json === "object") {
                Object.assign(result, json);
              }
              else {
                result.body = json;
              }
            }
          }
          catch (notJson) {
          }
        }
      }
      catch (e) {
      }

      throw result;
    }
  };
};
