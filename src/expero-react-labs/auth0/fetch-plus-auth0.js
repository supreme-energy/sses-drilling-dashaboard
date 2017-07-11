import {getAuth0} from './store';

/**
 * fetch-plus middleware that will inject the Auth0 token from the Redux store into
 * requests
 * @param store
 * @param tokenProperty
 * @returns {*}
 */
export default (store, predicate, tokenProperty = "idToken") => (request) => {
  // If they did not provide a predicate, or the predicate returns true for this request
  if (!predicate || predicate(request)) {
    const token = getAuth0(store.getState())[tokenProperty];

    if (token) {
      request.options.headers["Authorization"] = `Bearer ${token}`;
    }
  }
};
