import * as PIXI from "pixi.js";
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
    // Set up PIXI classes for rendering and draw layers
    // this.canvas = React.createRef();
    pixiApp.init(this.props, this.props.view, this.props.updateView);
    this.canvas.current.appendChild(pixiApp.renderer.view);

    this.updateWebGL();
    pixiApp.ticker.start();
  }

  shouldComponentUpdate(nextProps, nextState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    pixiApp.renderer.resize(this.props.width, this.props.height);
    pixiApp.stage.hitArea = new PIXI.Rectangle(0, 0, pixiApp.renderer.screen.width, pixiApp.renderer.screen.height);
    this.updateWebGL();
  }

  componentWillUnmount() {
    // TODO: Clean up and remove other objects to improve performance
    pixiApp.ticker.stop();
    this.canvas.current.removeChild(pixiApp.renderer.view);
  }

  render() {
    return <div className={css.crossSection} ref={this.canvas} />;
  }

  updateWebGL() {
    // Update all the PIXI object positions & scale controlled from react
    pixiApp.update(this.props);
  }
}

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
