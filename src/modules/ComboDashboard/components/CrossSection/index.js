import React, { Component } from "react";
import * as PIXI from "pixi.js";
import PropTypes from "prop-types";

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
      isOutside = false,
      prevX,
      prevY;

    stage.mousedown = function(moveData) {
      const pos = moveData.data.global;
      prevX = pos.x;
      prevY = pos.y;
      isDragging = true;
    };

    stage.mousemove = moveData => {
      if (!isDragging || isOutside) {
        return;
      }
      const pos = moveData.data.global;
      const dx = pos.x - prevX;
      const dy = pos.y - prevY;

      this.props.setView(prev => {
        return {
          ...prev,
          x: Number(prev.x) + dx,
          y: Number(prev.y) + dy
        };
      });

      prevX = pos.x;
      prevY = pos.y;
    };

    stage.mouseout = function() {
      isOutside = true;
    };
    stage.mouseover = function() {
      isOutside = false;
    };

    stage.mouseup = stage.mouseupoutside = function() {
      isDragging = false;
    };

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

    this.addDemoFormations(this.viewport);
    this.addGridlines(this.viewport, {
      yInterval: 50,
      xInterval: 50
    });

    this.rectangle = new PIXI.Graphics();
    this.rectangle.position = new PIXI.Point(300, 300);
    this.rectangle.beginFill(0xffff0b, 0.5);
    this.rectangle.drawRect(0, 0, 200, 200);
    this.rectangle.pivot = new PIXI.Point(100, 100);
    this.rectangle.endFill();
    this.subscribeToMoveEvents(this.rectangle, (pos, dragP) => {
      this.props.setX(pos.x - dragP.x);
      this.props.setY(pos.y - dragP.y);
    });
    this.viewport.addChild(this.rectangle);

    this.renderer.view["addEventListener"](
      "wheel",
      e => {
        let point = new PIXI.Point();
        this.interactionManager.mapPositionToPoint(point, e.clientX, e.clientY);
        this.props.setView({
          x: point.x,
          y: point.y
        });
      },
      false
    );

    window.viewport = this.viewport;
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
  }

  render() {
    const { x, y, view } = this.props;
    this.message.text = this.props.message;
    this.rectangle.position = new PIXI.Point(x, y);
    this.viewport.position = new PIXI.Point(view.x, view.y);

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
          fill: "#aaa",
          fontSize: 20
        });
        label.anchor.set(0.5, 0);
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
          fill: "#aaa",
          fontSize: 20
        });
        label.anchor.set(1, 0.5);
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
  subscribeToMoveEvents(obj, cb) {
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

  onDragMove(event) {
    if (this.dragging) {
      event.stopPropagation();
      var newPosition = this.data.getLocalPosition(this.parent);
      this.cb(newPosition, this.dragPoint);
    }
  }
}

CrossSection.propTypes = {
  message: PropTypes.string
};

export default CrossSection;
