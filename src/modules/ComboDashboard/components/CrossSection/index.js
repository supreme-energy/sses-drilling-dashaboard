import PropTypes from "prop-types";
import React, { Component } from "react";
import PixiCrossSection from "./PixiCrossSection";
import css from "./CrossSection.scss";

const pixiApp = new PixiCrossSection();

// PIXI has some lowercase constructors
/* eslint new-cap: 0 */
class CrossSection extends Component {
  constructor(props) {
    super(props);
    this.canvas = React.createRef();
  }

  componentDidMount() {
    pixiApp.init(this.props, this.props.view, this.props.updateView);

    this.canvas.current.appendChild(pixiApp.renderer.view);

    pixiApp.update(this.props);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    pixiApp.resize(this.props.width, this.props.height);
    pixiApp.update(this.props);
  }

  componentWillUnmount() {
    pixiApp.cleanUp();
    this.canvas.current.removeChild(pixiApp.renderer.view);
  }

  render() {
    return <div className={css.crossSection} ref={this.canvas} />;
  }
}

/* eslint react/no-unused-prop-types: 0 */
CrossSection.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  view: PropTypes.object,
  updateView: PropTypes.func,
  formations: PropTypes.array,
  projections: PropTypes.array,
  wellPlan: PropTypes.array,
  surveys: PropTypes.array
};

export default CrossSection;
