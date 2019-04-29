import * as PIXI from "pixi.js";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { drawSurveys } from "./drawSurveys";
import { drawWellPlan } from "./drawWellPlan";
import { drawGrid } from "./drawGrid.js";
import { drawFormations } from "./pixiUtils.js";
import { drawProjections, interactiveProjection } from "./drawProjections";

// PIXI has some lowercase constructors
/* eslint new-cap: 0 */
class CrossSection extends Component {
  constructor(props) {
    super(props);
    this.screenWidth = window.innerWidth;
    this.screenHeight = window.innerHeight - 300;

    // Set up PIXI classes for rendering and draw layers
    this.canvas = React.createRef();
    this.renderer = PIXI.autoDetectRenderer({
      width: this.screenWidth,
      height: this.screenHeight,
      antialias: true,
      backgroundColor: 0xffffff
    });
    this.interactionManager = new PIXI.interaction.InteractionManager(this.renderer);

    // Stage contains the draw layers and never moves. Some events are registered here.
    const stage = new PIXI.Container();
    // Viewport will contain our formations, well bore line, and other graphics
    this.viewport = new PIXI.Container();
    this.formationsLayer = this.viewport.addChild(new PIXI.Container());
    this.wellPathLayer = this.viewport.addChild(new PIXI.Container());
    this.UILayer = this.viewport.addChild(new PIXI.Container());
    this.gridLayer = this.viewport.addChild(new PIXI.Container());
    stage.addChild(this.viewport);

    // Set up events to enable panning of the viewport through stage
    let isDragging = false;
    let isOutside = false;
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
        e.preventDefault();
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

    // Create the formation layers
    drawFormations(this.formationsLayer, this.props.formations, this.props.surveys[this.props.surveys.length - 2]);

    const wellPlanUpdate = drawWellPlan(this.wellPathLayer, this.props.wellPlan);

    drawSurveys(this.wellPathLayer, this.props.surveys);

    const projectionLineUpdate = drawProjections(this.viewport, this.props.projections);
    const projectionUpdate = interactiveProjection(this.UILayer, this.props.view, this.props.updateView);

    const gridUpdate = drawGrid(this.gridLayer, this.screenWidth, this.screenHeight);
    // The ticker is used for render timing, what's done on each frame, etc
    this.ticker = PIXI.ticker.shared;
    this.ticker.add(() => {
      wellPlanUpdate();
      projectionLineUpdate();
      projectionUpdate(this.props.view);
      gridUpdate();
      this.renderer.render(stage);
    });
  }

  componentDidMount() {
    this.canvas.current.appendChild(this.renderer.view);

    this.updateWebGL();
    this.ticker.start();
  }

  shouldComponentUpdate(nextProps, nextState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    this.updateWebGL();
  }

  componentWillUnmount() {
    // TODO: Clean up and remove other objects to improve performance
    this.ticker.stop();
    this.canvas.current.removeChild(this.renderer.view);
    this.viewport.destroy({ children: true });
  }

  render() {
    return <div ref={this.canvas} />;
  }

  updateWebGL() {
    // Update all the PIXI object positions & scale controlled from react
    const { view } = this.props;
    this.viewport.position = new PIXI.Point(view.x, view.y);
    this.viewport.scale.x = view.xScale;
    this.viewport.scale.y = view.yScale;
  }
}

CrossSection.propTypes = {
  view: PropTypes.object,
  updateView: PropTypes.func,
  formations: PropTypes.array,
  projections: PropTypes.array,
  wellPlan: PropTypes.array,
  surveys: PropTypes.array
};

export default CrossSection;
