import { connect } from 'react-redux';
import { increment, doubleAsync, getCounter } from '../store';
import withFetchClient from 'react-powertools/data/withFetchClient';
import flowRight from 'lodash/flowRight';

/*  This is a container component. Notice it does not contain any JSX,
    nor does it import React. This component is **only** responsible for
    wiring in the actions and state necessary to render a presentational
    component - in this case, the counter:   */

import Counter from '../components/Counter';

/*  Object of action creators (can also be function that returns object).
    Keys will be passed as props to presentational components. Here we are
    implementing our wrapper around increment; the component doesn't care   */

const mapDispatchToProps = {
  increment : () => increment(1),
  doubleAsync
};

const mapStateToProps = (state) => ({
  counter : getCounter(state),
});

/*  Note: mapStateToProps is where you should use `reselect` to create selectors, ie:

    import { createSelector } from 'reselect'
    const counter = (state) => state.counter
    const tripleCount = createSelector(counter, (count) => count * 3)
    const mapStateToProps = (state) => ({
      counter: tripleCount(state)
    })

    Selectors can compute derived data, allowing Redux to store the minimal possible state.
    Selectors are efficient. A selector is not recomputed unless one of its arguments change.
    Selectors are composable. They can be used as input to other selectors.
    https://github.com/reactjs/reselect    */
/* We can use flowRight() from lodash to apply multiple operations in order to get all the data
 * our component needs.  In this example, we first apply connect() to get the current counter value
 * and actions that can be called.
 * We then call withFetchClient() to use the current counter value as an argument to our fetch call
 * to the server to get the squeared value.
 *
 * Flow right ensures that the calls are done in order from first to last.
 * This produces a function that can be applied to a component to apply all of these actions.
 */
const databind = flowRight([
  // get current counter value (and actions) from redux
  connect(mapStateToProps, mapDispatchToProps),
  // pass current counter value to server to get the squared value
  withFetchClient(
    "/auth/square/:counter",
    // only call the server if counter is > 5.
    // If counter < 5, then we will not have a doubled value (it will be undefined)
    ({counter}) => (counter > 5 && {counter}),
    {
      // reset to undefined whenever counter changes and we are waiting for fetch
      keepExistingWhilePending: false,
      // store the fetch info as the "square" prop
      propName: "square",
      // debounce the fetch calls.  e.g. wait 2s after the counter stops changing before sending request to server
      debounce: 2000,
      // Instead of returning the complicated prop to the component with all the withFetch info,
      // lets transform the prop into a simple scalar prop that will be one of:
      //    number - the number result from the fetch call if it is finished
      //    string - an error message if the fetch failed
      //    string - a loading message if the fetch is running
      //    string - a ... string if the result is undefined (e.g. when the counter <= 5)
      mapData: ({result, error, loading}) => result ? result.num : error ? error.message : loading ? "Loading" : "...",
    })
]);

export default databind(Counter);
