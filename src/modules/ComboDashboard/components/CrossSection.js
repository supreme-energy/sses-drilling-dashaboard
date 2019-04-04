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
    this.addGridlines(this.viewport, {
      yInterval: 100,
      xInterval: 100
    });

    this.rectangle = new PIXI.Graphics();
    this.rectangle.lineStyle(0);
    this.rectangle.position = new PIXI.Point(300, 300);
    this.rectangle.beginFill(0xffff0b, 0.5);
    this.rectangle.drawRect(0, 0, 200, 200);
    this.rectangle.endFill();
    this.subscribe(this.rectangle, pos => {
      this.props.setX(pos.x);
      this.props.setY(pos.y);
    });
    this.viewport.addChild(this.rectangle);
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

  shouldComponentUpdate(nextProps, nextState) {
    return true;
  }

  componentWillUpdate(nextProps, nextState) {}

  componentDidUpdate(prevProps, prevState) {}

  componentWillUnmount() {
    this.app.stop();
  }

  render() {
    const { x, y } = this.props;
    this.message.text = this.props.message;
    this.rectangle.position = new PIXI.Point(x, y);

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

  /**
   * Add grid lines to a PIXI.Container
   * @param container The PIXI container to add gridlines to
   * @param options   Options for grid intervals, labels, etc
   */
  addGridlines(container, options = {}) {
    let w = container.width;
    let h = container.height;
    let xHide = options.xHide || false;
    let xInterval = options.xInterval || 50;
    let yHide = options.yHide || false;
    let yInterval = options.yInterval || 50;

    // Generate lines for x axis
    if (!xHide) {
      for (let i = 0; i < w; i += xInterval) {
        let label = new PIXI.Text(i, {
          fill: "#fff",
          fontSize: 20
        });
        label.anchor.set(0.5, 0.5);
        label.x = i;
        label.y = h;
        container.addChild(label);

        let line = new PIXI.Graphics();
        line.lineStyle(2, 0xaaaaaa, 0.3);
        line.moveTo(i, 0);
        line.lineTo(i, h);
        container.addChild(line);
      }
    }

    // Generate lines for y axis
    if (!yHide) {
      for (let i = 0; i < h; i += yInterval) {
        let label = new PIXI.Text(i, {
          fill: "#fff",
          fontSize: 20
        });
        label.anchor.set(0, 0.5);
        label.x = 0;
        label.y = i;
        container.addChild(label);

        let line = new PIXI.Graphics();
        line.lineStyle(2, 0xaaaaaa, 0.3);
        line.moveTo(0, i);
        line.lineTo(w, i);
        container.addChild(line);
      }
    }
  }
  subscribe(obj, cb) {
    obj.interactive = true;
    obj.cb = cb || (_ => {});
    obj
      .on("mousedown", this.onDragStart)
      .on("touchstart", this.onDragStart)
      .on("mouseup", this.onDragEnd)
      .on("mouseupoutside", this.onDragEnd)
      .on("touchend", this.onDragEnd)
      .on("touchendoutside", this.onDragEnd)
      .on("mousemove", this.onDragMove)
      .on("touchmove", this.onDragMove);
  }

  onDragStart(event) {
    if (!this.dragging) {
      event.stopPropagation();
      this.data = event.data;
      this.dragging = true;

      this.scale.x *= 1.1;
      this.scale.y *= 1.1;
      // Point relative to the center of the object
      this.dragPoint = event.data.getLocalPosition(this.parent);
      this.dragPoint.x -= this.x;
      this.dragPoint.y -= this.y;
    }
  }

  onDragEnd() {
    if (this.dragging) {
      this.dragging = false;
      this.scale.x /= 1.1;
      this.scale.y /= 1.1;
      // set the interaction data to null
      this.data = null;
    }
  }

  onDragMove() {
    if (this.dragging) {
      event.stopPropagation();
      var newPosition = this.data.getLocalPosition(this.parent);
      // this.x = newPosition.x - this.dragPoint.x;
      // this.y = newPosition.y - this.dragPoint.y;
      this.cb(newPosition);
    }
  }
}

CrossSection.propTypes = {
  message: PropTypes.string
};

export default CrossSection;
