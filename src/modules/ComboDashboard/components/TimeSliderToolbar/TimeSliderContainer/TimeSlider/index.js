import React from "react";
import PropTypes from "prop-types";
import * as PIXI from "pixi.js";

const EXPANDED_HEIGHT = 100;
const COLLAPSED_HEIGHT = 25;
class TimeSlider extends React.Component {
  constructor(props) {
    super(props);
    // Create a Pixi Application
    this.canvas = React.createRef();

    this.renderer = new PIXI.Application({
      width: 900, // default: 800
      height: this.props.expanded ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT, // default: 600
      antialias: true, // default: false
      transparent: false, // default: false
      resolution: 1, // default: 1,
      backgroundColor: 0xffffff
    });

    // Add the canvas that Pixi automatically created for you to the HTML document
    // create the root of the scene graph
    var stage = new PIXI.Container();

    stage.interactive = true;

    var graphics = new PIXI.Graphics();

    // set a fill and line style
    graphics.beginFill(0xff3300);
    graphics.lineStyle(10, 0xffd900, 1);

    // draw a shape
    graphics.moveTo(50, 50);
    graphics.lineTo(250, 50);
    graphics.lineTo(100, 100);
    graphics.lineTo(250, 220);
    graphics.lineTo(50, 220);
    graphics.lineTo(50, 50);
    graphics.endFill();

    // set a fill and line style again
    graphics.lineStyle(10, 0xff0000, 0.8);
    graphics.beginFill(0xff700b, 1);

    // draw a second shape
    graphics.moveTo(210, 300);
    graphics.lineTo(450, 320);
    graphics.lineTo(570, 350);
    graphics.quadraticCurveTo(600, 0, 480, 100);
    graphics.lineTo(330, 120);
    graphics.lineTo(410, 200);
    graphics.lineTo(210, 300);
    graphics.endFill();

    // draw a rectangle
    graphics.lineStyle(2, 0x0000ff, 1);
    graphics.drawRect(50, 250, 100, 100);

    // draw a circle
    graphics.lineStyle(0);
    graphics.beginFill(0xffff0b, 0.5);
    graphics.drawCircle(470, 200, 100);
    graphics.endFill();

    graphics.lineStyle(20, 0x33ff00);
    graphics.moveTo(30, 30);
    graphics.lineTo(600, 300);

    stage.addChild(graphics);

    document.body.appendChild(this.renderer.view);

    this.renderer.render(stage);
  }

  componentDidMount() {
    this.canvas.current.appendChild(this.renderer.view);
    const h = this.props.expanded ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT;
    this.renderer.renderer.resize(this.canvas.current.offsetWidth - 170, h);
  }

  componentDidUpdate({ expanded }) {
    if (expanded !== this.props.expanded) {
      const h = this.props.expanded ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT;
      this.renderer.renderer.resize(this.canvas.current.offsetWidth - 170, h);
    }
  }

  render() {
    return <div ref={this.canvas} />;
  }
}

TimeSlider.propTypes = {
  expanded: PropTypes.bool
};

export default TimeSlider;
