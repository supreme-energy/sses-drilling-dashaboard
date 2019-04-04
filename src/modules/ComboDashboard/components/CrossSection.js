import React, { Component } from "react";
import * as PIXI from "pixi.js";
import PropTypes from "prop-types";
import Viewport from "pixi-viewport";

class CrossSection extends Component {
  constructor(props) {
    super(props);
    this.screenWidth = 800;
    this.screenHeight = 600;
    this.worldHeight = 1000;
    this.worldWidth = 1000;

    this.canvas = React.createRef();
    this.app = new PIXI.Application(this.screenWidth, this.screenHeight);

    this.viewport = new Viewport({
      screenWidth: this.screenWidth,
      screenHeight: this.screenHeight,
      worldWidth: this.worldWidth,
      worldHeight: this.worldHeight,
      interaction: this.app.renderer.plugins.interaction
    });

    this.app.stage.addChild(this.viewport);

    this.viewport
      .drag()
      .pinch()
      .wheel();

    this.message = new PIXI.Text("", {
      fontFamily: "Arial",
      fontStyle: "italic",
      fontWeight: "bold",
      fill: "#fff",
      wordWrap: true,
      wordWrapWidth: 440
    });

    this.addDemoFormations(this.viewport);
  }

  componentWillMount() {}

  componentDidMount() {
    this.canvas.current.appendChild(this.app.view);

    this.message.x = 30;
    this.message.y = 30;

    this.viewport.addChild(this.message);
    this.app.start();
  }

  componentWillReceiveProps(nextProps) {}

  shouldComponentUpdate(nextProps, nextState) {}

  componentWillUpdate(nextProps, nextState) {}

  componentDidUpdate(prevProps, prevState) {}

  componentWillUnmount() {
    this.app.stop();
  }

  render() {
    this.message.text = this.props.message;

    return <div ref={this.canvas} />;
  }

  addDemoFormations(container) {
    const layerColors = [0xd8d8d8, 0xcac297, 0xb3b59a, 0xd8d8b3, 0xb3b59a, 0xcdd8d8];
    const topPolyLine = [0, 0, this.worldWidth, 0].reverse();
    const bottomPolyLIne = [this.worldWidth, this.worldHeight, 0, this.worldHeight];
    let prevPath = topPolyLine;
    for (let layer = 0; layer < layerColors.length; layer++) {
      let nextPath = [];
      let anchor = ((layer + 1) * this.worldHeight) / layerColors.length;

      let horizontalPoints = this.worldWidth / 100;
      for (let i = horizontalPoints; i >= 0; i--) {
        let p = [
          (i * this.worldWidth) / horizontalPoints,
          anchor + Math.random() * (this.worldHeight / (layerColors.length * 3))
        ];
        nextPath.push(p);
      }

      if (layer === layerColors.length - 1) nextPath = bottomPolyLIne;

      let poly = new PIXI.Graphics();
      poly.lineStyle(0);
      poly.beginFill(layerColors[layer], 1);
      poly.drawPolygon(
        prevPath
          .reverse()
          .flat()
          .concat(nextPath.flat())
      );

      poly.closePath();
      container.addChild(poly);

      prevPath = nextPath;
    }
  }
}

CrossSection.propTypes = {
  message: PropTypes.string
};

export default CrossSection;
