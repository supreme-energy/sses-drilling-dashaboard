import React from 'react';
import uniqueId from 'lodash/uniqueId';
import debounce from 'lodash/debounce';
import delay from '../delay';
import shallowequal from 'shallowequal';

/**
 *
 * Injects the following prop into your component:
 *
 * data: PropTypes.shape({
 *   loading: PropTypes.bool.isRequired, // true when data is being fetched after the props change
 *   polling: PropTypes.bool.isRequired, // true when data is being re-fetched due to pollInterval expiring
 *   error: PropTypes.any, // if the fetch fails, this will be the error from the fetch, otherwise undefined
 *   result: PropTypes.any, // if the fetch succeeds, this will be the result of the fetch, otherwise undefined
 * }).isRequired,
 *
 * @param propsToArgs : function (props : Object, context: Object) : Object
 *      Called each time the props passed into your component change.  Returns an object of the arguments
 *      that are required to fetch the data.  These arguments will be passed to the argsToPromise function
 *      whenever they change.
 *
 *      If your component receives React context, then this context will be passed as a second argument
 *      to propsToArgs
 *
 * @param argsToPromise : function (args : Object, isPolling : Boolean ) : Promise
 *      Called whenever data needs to be fetched.  Args are the arguments derived from props via propsToArgs
 *      isPolling will be false on the initial fetch when the args change.  It will be true if the data is being
 *      refreshed due to pollInterval expiring
 *
 * @param options - optional options object:
 *   * keepExistingWhilePending : boolean
 *      when your props change and require fetching new data, this boolean controls what happens to the old
 *      data while the new data is fetched.  If true, your component will continue to receive the old data
 *      as "data.result" until the new data arrives.  the component can use "data.loading" if it needs to know
 *      that the data is stale.  This setting is useful to prevent flash to blank screen while waiting on new data
 *      If false, then data.result will be undefined while the new data loads.
 *
 *      Defaults to true
 *
 *    * isEqual : function (nextArgs, prevArgs) : boolean
 *       comparison function used to compare the previous results of propsToArgs with the new results.
 *
 *       Defaults to shallowCompare
 *
 *    * pollInterval: Number | function(data):Number | function(data):Promise
 *       If defined, then causes the component to periodically poll for fresh data.
 *
 *       If the value is a Number, then it represents a time interval (in milliseconds) between polls
 *       If the value is a function, then it will be called with the current data and should return either:
 *         - the number of milliseconds until the data should be refreshed.
 *         - a Promise which will resolve when it is time to refresh the data
 *
 *    * debounce: Number | { wait: Number = 0, leading: Boolean = false, trailing: Boolean = true, maxWait: Number }
 *       If a number is given, then calls to argsToPromise will be debounced until the props stop changing for that
 *       number of milliseconds.
 *
 *       If an object is given, then you can provide more fine-grained control over how the debouncing will function:
 *       - wait - the number of ms to delay
 *       - leading - specify whether the call should be made at the beginning of the timeout
 *       - trailing - specify whether the call should be made at the end of the timeout.
 *       - maxWait - The maximum time the call can be delayed
 *
 *       If trailing and leading are true, then the call will only be made on the trailing edge of the timeout
 *       if props changed more than once during the timeout.
 *
 *       Examples:
 *         Traditional debounce can be made using: { wait: 200, leading: false, trailing: true }
 *         Traditional throttle can be made using: { wait: 200, maxWait: 200, leading: true, trailing: true }
 *
 *    * propName: String
 *       The name of the prop to inject into your component.
 *
 *       Default: "data"
 *
 *    * args: Object
 *      If defined, represents a default Args object.  The Arg object returned from propsToArgs
 *      will be shallow-merged with this default args object (propsToArgs result will override values in this object)
 *
 *
 * @returns function(Component):WrappedComponent
 *
 * returns a function decorator which can be used to wrap components that need this data.
 * e.g. const MyComponentWithData = withData(...)(MyComponent)
 */
export default function withData(propsToArgs, argsToPromise, options = {}) {
  const {
    keepExistingWhilePending = true,
    isEqual = shallowequal,
    pollInterval,
    debounce: debounceOptions,
    propName = "data",
    args
  } = options;
  let getPollInterval;
  if (typeof pollInterval === "number") {
    // they gave us a number, presumably mills between polls
    getPollInterval = () => delay(pollInterval);
  }
  else if (typeof pollInterval === "function") {
    // they gave us a function
    getPollInterval = data => {
      const p = pollInterval(data);
      if (typeof p === "number") {
        // function returned a ms delay
        return delay(p);
      }
      if (p && p.then) {
        // function returned a promise
        return p;
      }
    };
  }

  // call propsToArgs and possibly merge with args
  let getArgs = args ? (props, context) => ({...args, ...propsToArgs(props, context)}) : propsToArgs;

  return Component => {
    class DataComponent extends React.Component {
      constructor (props, context) {
        super(props, context);

        this._mounted = true;
        this._requestId = undefined;
        this.state = {
          args: getArgs(props, context),
          requestId: uniqueId(),
          data: {
            loading: true,
          },
        };

        if (debounceOptions) {
          const callLoadDataAsync = (state) => this.loadDataAsync(state);
          if (typeof debounceOptions === "number") {
            // they just gave us a debounce time
            this.loadDataAsyncDebounced = debounce(callLoadDataAsync, debounceOptions);
          }
          else {
            // they gave us an options object
            const {wait = 0, ...remainingOptions} = debounceOptions;
            this.loadDataAsyncDebounced = debounce(callLoadDataAsync, wait, remainingOptions);
          }
        }
        else {
          this.loadDataAsyncDebounced = this.loadDataAsync;
          this.loadDataAsyncDebounced.cancel = () => {};
        }
      }

      componentWillReceiveProps (nextProps, nextContext) {
        // get the data args from the props
        const nextArgs = getArgs(nextProps, nextContext);
        // see if they are different than the previous args
        if (!isEqual(nextArgs, this.state.args)) {
          // update state to set us back to "loading"
          this.setState({
            args: nextArgs,
            data: {
              loading: true,
              result: keepExistingWhilePending ? this.state.data.result : undefined,
            },
            requestId: uniqueId(),
          });
        }
      }

      componentDidUpdate (prevProps) {
        if (this._requestId !== this.state.requestId) {
          this._requestId = this.state.requestId;
          this.doNextLoadData(this.state);
        }
      }

      componentDidMount () {
        this._requestId = this.state.requestId;
        this.loadDataAsync(this.state);
      }

      componentWillUnmount () {
        this._mounted = false;

        // cancel any pending debounced calls to load data
        this.loadDataAsyncDebounced.cancel();
      }

      render () {
        const props = this.props;
        const injectedProp = {[propName]: this.state.data};

        return (
          <Component {...props} {...injectedProp} />
        );
      }

      async performPoll (requestId) {
        if (getPollInterval && this._mounted) {
          await getPollInterval(this.state.data);
          if (this._mounted) {
            this.setState(prevState => {
              if (prevState.requestId === requestId) {
                return {
                  data: {
                    ...prevState.data,
                    loading: false,
                    polling: true,
                  },
                  requestId: uniqueId(),
                  args: prevState.args,
                };
              }
            });
          }
        }
      }

      doNextLoadData(state) {
        if (state.data && state.data.polling) {
          // we are polling.  Make the call immediately
          this.loadDataAsync(state);
        }
        else {
          // we are querying new data.  Debounce the call
          this.loadDataAsyncDebounced(state);
        }
      }

      async loadDataAsync ({ requestId, args, data }) {
        let newState;
        const isPolling = data && data.polling;
        try {
          newState = {
            data: {
              result: await argsToPromise(args, !!isPolling)
            },
          };
        }
        catch (e) {
          newState = {
            data: {
              error: e
            }
          };
        }

        // update the state if we are still mounted and the request is not stale
        if (this._mounted) {
          if (this.state.requestId === requestId) {
            this.setState(newState, () => this.performPoll(requestId));
          }
        }
      }
    }

    DataComponent.displayName = `WithData(${Component.displayName || Component.name || 'Component'})`;

    // Capture any context the child declares so that we can pass it to propsToArgs
    if (Component.contextTypes) {
      DataComponent.contextTypes = Component.contextTypes;
    }

    // Copy the propTypes from the child, stripping out the data prop we will inject
    if (Component.propTypes) {
      const {[propName]: data, ...remainingPropTypes} = Component.propTypes;
      DataComponent.propTypes = remainingPropTypes;
    }

    return DataComponent;
  };
}
