import React from 'react';
import upperFirst from 'lodash/upperFirst';
import mapValues from 'lodash/mapValues';
import uniqueId from 'lodash/uniqueId';
import debounce from 'lodash/debounce';
import delay from '../delay';
import shallowequal from 'shallowequal';
import memoize from '../memoize';
import hoc from '../hoc';

function createInitialStateFactory(initialState) {
  // if initialState is already a factory function, return it
  // else return a function that will return a copy of initialState each time it is called
  return (typeof initialState === "function") ? initialState : () => ({...initialState});
}

function createDefaultActions(initialStateFactory) {
  const initialState = initialStateFactory({}, {});
  const keys = Object.keys(initialState);
  const actions = {
    // method to bulk change multiple values
    onStateChange(newState) { this.setState(newState); }
  };

  // generate methods to change individual values
  for (const key of keys) {
    const Key = upperFirst(key);
    switch (typeof initialState[key]) {
      case "boolean":
        // Add onKeyOn, onKeyOff, onKeyToggle methods
        actions[`on${Key}On`] = function () { this.setState({ [key]: true }); };
        actions[`on${Key}Off`] = function () { this.setState({ [key]: false }); };
        actions[`on${Key}Toggle`] = function () { this.setState(p => ({[key]: !p[key]})); };
        break;
      default:
        // create an onKeyChanged() method
        actions[`on${Key}Changed`] = function (value) { this.setState({ [key]: value }); };
        break;
    }
  }

  return actions;
}

function createActions(initialStateFactory, actions) {
  if (typeof actions === "function") {
    // it is a factory.  Call the factory and pass in the default actions
    // wrap it in a method that will pass in the default actions
    const defaultActions = createDefaultActions(initialStateFactory);
    return actions(defaultActions);
  }

  // If they supplied a set of actions, just return them
  if (actions) {
    return actions;
  }

  // If they did not supply a set of actions
  // just use the default actions
  // returns the default actions.
  return createDefaultActions(initialStateFactory);
}

/**
 * Creates a higher order component to hold state and pass state update methods into your view component
 * @param initialState
 *    The initial state object, or a function that takes (props, context) as input and returns the initial state object.
 *    If a factory function is supplied, it will be called once with empty object for props and context to get a
 *    representative state object to be used to define the actions
 * @param actions
 *    Optional set of state update actions to pass to your component.
 *    If not supplied, a default set of actions will be supplied as:
 *       a onXxxChanged(newValue) action for each state property
 *       a onXxxOn() action for each boolean state property to force the value to true
 *       a onXxxOff() action for each boolean state property to force the value to false
 *       a onXxxToggle() action for each boolean state property to toggle the value
 *       a onStateChange({...}) action to bulk change state properties.  Pass a partial or full state update object
 *    You may also pass a factory function of the form: actionFactory(defaultActionObject) => actionObject
 *       It will be called with an object containing the default generated actions.  It should return
 *       an action object with the actual actions to be passed down as props
 */
export default function withState(initialState, actions) {
  if (!initialState) {
    throw new Error("must supply an initialState object or factory method");
  }

  const initialStateFactory = createInitialStateFactory(initialState);
  const actionSet = createActions(initialStateFactory, actions);

  return hoc(Component => {
    class StateComponent extends React.Component {
      constructor(props, context) {
        super(props, context);
        this.state = initialStateFactory(props, context);
        // bind the actionSet to this component
        this.actions = mapValues(actionSet, action => action.bind(this));
      }

      render() {
        const {props, state, actions} = this;

        // pass props down
        // pass state down as props
        // pass actions down as props
        return (
          <Component {...props} {...state} {...actions} />
        );
      }
    }

    // Capture any context the child declares so that we can pass it to the initialStateFactory
    if (Component.contextTypes) {
      StateComponent.contextTypes = Component.contextTypes;
    }

    return StateComponent;
  }, "WithState");
}
