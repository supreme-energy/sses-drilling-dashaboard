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

    // Set up PIXI classes for rendering and draw layers
    this.canvas = React.createRef();
    this.renderer = PIXI.autoDetectRenderer({
      width: this.screenWidth,
      height: this.screenHeight,
      antialias: true,
      backgroundColor: 0xffffff
    });
    this.interactionManager = new PIXI.interaction.InteractionManager(this.renderer);

    // Viewport will contain our formations, well bore line, and other graphics
    // TODO: Add UI container
    this.viewport = new PIXI.Container();
    // Stage contains the draw layers and never moves. Some events are registered here.
    let stage = new PIXI.Container();
    stage.addChild(this.viewport);

    // Set up events to enable panning of the viewport through stage
    let isDragging = false,
      isOutside = false;
    const prevMouse = {};
    stage.interactive = true;
    stage.hitArea = new PIXI.Rectangle(0, 0, this.screenWidth, this.screenHeight);

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
      this.props.updateView({
        x: Number(prev.x) + (currMouse.x - prevMouse.x),
        y: Number(prev.y) + (currMouse.y - prevMouse.y)
      });

      Object.assign(prevMouse, currMouse);
    };
    stage.mouseout = () => (isOutside = true);
    stage.mouseover = () => (isOutside = false);
    stage.mouseup = stage.mouseupoutside = () => (isDragging = false);

    // Set up zooming on the viewport.  Viewport positioning and scale is controlled via props.setView()
    const globalMouse = { x: 0, y: 0 };
    this.renderer.view["addEventListener"](
      "wheel",
      e => {
        this.interactionManager.mapPositionToPoint(globalMouse, e.clientX, e.clientY);

        // sign of deltaY (-1,0,1) determines zoom in or out
        const factor = 1 - Math.sign(e.deltaY) * 0.03;
        const prev = this.props.view;
        this.props.updateView({
          x: globalMouse.x - (globalMouse.x - prev.x) * factor,
          y: globalMouse.y - (globalMouse.y - prev.y) * factor,
          xScale: prev.xScale * factor,
          yScale: prev.yScale * factor
        });
      },
      false
    );

    // The ticker is used for render timing, what's done on each frame, etc
    this.ticker = PIXI.ticker.shared;
    this.ticker.add(() => this.renderer.render(stage));

    // Begin adding content to the viewport
    this.message = new PIXI.Text("", {
      fontFamily: "Arial",
      fontStyle: "italic",
      fontWeight: "bold",
      fill: "#fff",
      wordWrap: true,
      wordWrapWidth: 440
    });

    // Create the formation layers
    addDemoFormations(this.viewport, this.worldWidth, this.worldHeight);

    // Draw the well plan line
    let wpData = this.props.wellPlan.map(x => [Number(x.md), Number(x.tvd)]);
    let wellplan = new PIXI.Graphics();
    wellplan.lineStyle(3, 0x44ff44, 1);
    wellplan.moveTo(...wpData[0]);
    for (let i = 1; i < wpData.length; i++) {
      wellplan.lineTo(...wpData[i]);
    }
    this.viewport.addChild(wellplan);

    let iconTexture = new PIXI.Texture.fromImage("./Survey.svg");

    let sData = this.props.surveys.map(x => [Number(x.md), Number(x.tvd)]);
    for (let i = 0; i < sData.length; i++) {
      let icon = new PIXI.Sprite(iconTexture);
      icon.position = new PIXI.Point(...sData[i]);
      icon.scale.set(0.25);
      icon.anchor.set(0.5, 0.5);
      this.viewport.addChild(icon);
    }

    // Gridlines go last
    addGridlines(this.viewport, {});

    this.rectangle = new PIXI.Graphics();
    this.rectangle.beginFill(0x888888, 0.5);
    this.rectangle.drawRect(0, 0, 200, this.worldHeight);
    this.rectangle.pivot = new PIXI.Point(100, this.worldHeight / 2);
    this.rectangle.endFill();
    subscribeToMoveEvents(this.rectangle, pos => {
      this.props.updateX(pos.x);
      // Lock y movement for demo
      //this.props.setY(pos.y);
    });
    this.viewport.addChild(this.rectangle);
  }

  componentDidMount() {
    this.canvas.current.appendChild(this.renderer.view);

    this.message.x = 30;
    this.message.y = 30;

    this.viewport.addChild(this.message);
    this.ticker.start();
  }

  shouldComponentUpdate(nextProps, nextState) {
    return true;
  }

  componentWillUnmount() {
    // TODO: Clean up and remove other objects to improve performance
    this.ticker.stop();
    this.canvas.current.removeChild(this.renderer.view);
  }

  render() {
    // Update all the PIXI object positions & scale controlled from react
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
  message: PropTypes.string,
  x: PropTypes.number,
  y: PropTypes.number,
  updateX: PropTypes.func,
  updateY: PropTypes.func,
  view: PropTypes.object,
  updateView: PropTypes.func
};

export default CrossSection;
