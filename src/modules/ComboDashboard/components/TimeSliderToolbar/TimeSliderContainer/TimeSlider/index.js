import React from "react";
import PropTypes from "prop-types";
import Slider from "@material-ui/lab/Slider";
import * as PIXI from "pixi.js";

import { STEP_VALUE } from "../index";
import classes from "../TimeSlider.scss";

const HEIGHT = 60;

class TimeSlider extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentStep: this.props.step
    };

    this.sliderIntervalId = 0;

    this.stage = new PIXI.Container();

    this.canvas = React.createRef();

    this.screenWidth = window.innerWidth;

    this.screenHeight = window.innerHeight - 400;

    this.app = new PIXI.Application({
      width: this.screenWidth - 250, // default: 800
      height: HEIGHT, // default: 600
      antialias: true, // default: false
      transparent: false, // default: false
      resolution: 1, // default: 1,
      backgroundColor: 0xffffff
    });

    this.app.renderer.autoResize = true;

    this.stage.interactive = true;

    this.graphics = new PIXI.Graphics();
  }

  componentDidMount() {
    this.resizeCanvas();
    this.drawGraph();
  }

  componentDidUpdate(prevProps) {
    const { expanded, zoom } = this.props;
    // Redraw graphs if Time Slider is collapsed or expanded
    if (prevProps.expanded !== expanded && expanded) {
      this.resizeCanvas();
      this.drawGraph();
    }

    // Set zoom level
    if (prevProps.zoom !== zoom) {
      this.drawGraph(zoom);
    }
  }

  resizeCanvas() {
    this.app.renderer.resize(this.screenWidth - 250, HEIGHT);
  }

  drawGraph(zoom) {
    if (this.app.view) {
      // this.canvas.current.removeChild(this.app.view);
    }

    this.graphics.lineStyle(5, 0xb6ba3e);
    // this.graphics.moveTo(0, height);
    // this.graphics.lineTo(100, height);

    this.app.stage.addChild(this.graphics);
    this.canvas.current.appendChild(this.app.view);
    this.app.render(this.stage);
  }

  handleSetSlider = (_, currentStep) => {
    // this.setState({ currentStep });
    this.props.setSliderStep(currentStep);
  };

  render() {
    const { expanded } = this.props;
    return (
      <div className={classes.timeSliderComponent}>
        {expanded && <div className={classes.timeSliderGraph} ref={this.canvas} />}
        <Slider
          className={expanded ? classes.timeSliderExpanded : classes.timeSliderCollapsed}
          value={this.props.step}
          onChange={this.handleSetSlider}
          step={STEP_VALUE}
        />
      </div>
    );
  }
}

TimeSlider.propTypes = {
  expanded: PropTypes.bool,
  step: PropTypes.number,
  zoom: PropTypes.number,
  setSliderStep: PropTypes.func
};

export default TimeSlider;
