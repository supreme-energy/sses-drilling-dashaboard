import hoistStatics from "hoist-non-react-statics";

/**
 * Wraps your HOC component factory in a method that hoists statics and assigns a name to the HOC component
 * @param factory
 * @param name
 */
export default (factory, name = "HOC") => Component => {
  const NewComponent = factory(Component);
  NewComponent.displayName = `${name}(${Component.displayName || Component.name || "Component"})`;
  return hoistStatics(NewComponent, Component);
};
