import React, { Component } from "react";
import * as PIXI from "pixi.js";
import PropTypes from "prop-types";
import { addDemoFormations, addGridlines, subscribeToMoveEvents } from "./pixiUtils.js";

class CrossSection extends Component {
  constructor(props) {
    super(props);
    this.screenWidth = 800;
    this.screenHeight = 600;
    this.worldHeight = 1000;
    this.worldWidth = 1000;

    this.canvas = React.createRef();
    this.renderer = PIXI.autoDetectRenderer({
      width: this.screenWidth,
      height: this.screenHeight,
      antialias: true,
      backgroundColor: 0xffffff
    });
    this.interactionManager = new PIXI.interaction.InteractionManager(this.renderer);

    this.viewport = new PIXI.Container();
    let stage = new PIXI.Container();
    stage.addChild(this.viewport);

    stage.interactive = true;
    stage.hitArea = new PIXI.Rectangle(0, 0, this.screenWidth, this.screenHeight);
    let isDragging = false,
      isOutside = false;
    const prevMouse = {};

    stage.mousedown = function(moveData) {
      const pos = moveData.data.global;
      Object.assign(prevMouse, pos);
      isDragging = true;
    };

    stage.mousemove = moveData => {
      if (!isDragging || isOutside) {
        return;
      }
      const prev = this.props.view;
      const currMouse = moveData.data.global;
      this.props.setView({
        x: Number(prev.x) + (currMouse.x - prevMouse.x),
        y: Number(prev.y) + (currMouse.y - prevMouse.y)
      });

      Object.assign(prevMouse, currMouse);
    };

    stage.mouseout = () => (isOutside = true);
    stage.mouseover = () => (isOutside = false);
    stage.mouseup = stage.mouseupoutside = () => (isDragging = false);

    this.ticker = PIXI.ticker.shared;
    this.ticker.add(() => this.renderer.render(stage));

    this.message = new PIXI.Text("", {
      fontFamily: "Arial",
      fontStyle: "italic",
      fontWeight: "bold",
      fill: "#fff",
      wordWrap: true,
      wordWrapWidth: 440
    });

    addDemoFormations(this.viewport, this.worldWidth, this.worldHeight);
    addGridlines(this.viewport, {});

    this.rectangle = new PIXI.Graphics();
    this.rectangle.position = new PIXI.Point(300, 300);
    this.rectangle.beginFill(0xffff0b, 0.5);
    this.rectangle.drawRect(0, 0, 200, 200);
    this.rectangle.pivot = new PIXI.Point(100, 100);
    this.rectangle.endFill();
    subscribeToMoveEvents(this.rectangle, pos => {
      this.props.setX(pos.x);
      this.props.setY(pos.y);
    });
    this.viewport.addChild(this.rectangle);

    const globalMouse = { x: 0, y: 0 };
    this.renderer.view["addEventListener"](
      "wheel",
      e => {
        this.interactionManager.mapPositionToPoint(globalMouse, e.clientX, e.clientY);

        // sign of deltaY (-1,0,1) determines zoom in or out
        const factor = 1 - Math.sign(e.deltaY) * 0.03;
        const prev = this.props.view;
        this.props.setView({
          x: globalMouse.x - (globalMouse.x - prev.x) * factor,
          y: globalMouse.y - (globalMouse.y - prev.y) * factor,
          xScale: prev.xScale * factor,
          yScale: prev.yScale * factor
        });
      },
      false
    );
  }

  componentWillMount() {}

  componentDidMount() {
    this.canvas.current.appendChild(this.renderer.view);

    this.message.x = 30;
    this.message.y = 30;

    this.viewport.addChild(this.message);
    this.ticker.start();
  }

  componentWillReceiveProps(nextProps) {}

  shouldComponentUpdate(nextProps, nextState) {
    return true;
  }

  componentWillUpdate(nextProps, nextState) {}

  componentDidUpdate(prevProps, prevState) {}

  componentWillUnmount() {
    // TODO: Clean up and remove other objects to improve performance
    this.ticker.stop();
    this.canvas.current.removeChild(this.renderer.view);
  }

  render() {
    const { x, y, view } = this.props;
    this.message.text = this.props.message;
    this.rectangle.position = new PIXI.Point(x, y);
    this.viewport.position = new PIXI.Point(view.x, view.y);
    this.viewport.scale.x = view.xScale;
    this.viewport.scale.y = view.yScale;

    return <div ref={this.canvas} />;
  }
}

CrossSection.propTypes = {
  message: PropTypes.string
};

export default CrossSection;
