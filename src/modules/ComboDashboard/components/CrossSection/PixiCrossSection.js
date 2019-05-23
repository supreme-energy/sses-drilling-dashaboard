import * as PIXI from "pixi.js";
import { drawFormations } from "./drawFormations";
import { drawSurveys } from "./drawSurveys";
import { drawWellPlan } from "./drawWellPlan";
import { drawGrid } from "./drawGrid.js";
import { drawProjections } from "./drawProjections";
import { drawSections } from "./drawSections";
import { interactiveProjection } from "./interactiveProjection";
import { removeAllChildren } from "./pixiUtils";

export default class PixiCrossSection {
  constructor() {
    this.renderer = PIXI.autoDetectRenderer({
      width: 0,
      height: 0,
      antialias: true,
      autoResize: true,
      resolution: devicePixelRatio,
      backgroundColor: 0xffffff
    });
    this.interactionManager = new PIXI.interaction.InteractionManager(this.renderer);

    // Stage contains the draw layers and never moves. Some events are registered here.
    this.stage = new PIXI.Container();
    // Viewport will contain our formations, well bore line, and other graphics
    this.viewport = new PIXI.Container();
    // Set up PIXI classes for rendering and draw layers
    this.formationsLayer = this.viewport.addChild(new PIXI.Container());
    this.wellPathLayer = this.viewport.addChild(new PIXI.Container());
    this.UILayer = this.viewport.addChild(new PIXI.Container());
    this.gridLayer = this.viewport.addChild(new PIXI.Container());
    this.stage.addChild(this.viewport);

    this.makeInteractive(this.stage);
  }
  init(props, viewData, viewDataUpdate) {
    this.viewDataUpdate = viewDataUpdate;
    const gridGutter = 50;
    // Create the formation layers
    this.formationsUpdate = drawFormations(
      this.formationsLayer,
      props.formations,
      props.surveys[props.surveys.length - 2]
    );

    this.wellPlanUpdate = drawWellPlan(this.wellPathLayer, props.wellPlan);
    this.surveyUpdate = drawSurveys(this.wellPathLayer, props.surveys);
    this.projectionLineUpdate = drawProjections(this.wellPathLayer, props);
    this.sectionUpdate = drawSections(this.UILayer, props, gridGutter);
    this.interactivePAUpdate = interactiveProjection(this.UILayer, props);
    this.gridUpdate = drawGrid(this.gridLayer, gridGutter);
    // The ticker is used for render timing, what's done on each frame, etc
    this.ticker = PIXI.ticker.shared;
    this.newProps = true;
    this.ticker.add(() => {
      if (this.newProps) {
        this.renderer.render(this.stage);
        this.newProps = false;
      }
    });

    this.ticker.start();
  }
  makeInteractive(stage) {
    // Set up events to enable panning of the viewport through stage
    let isDragging = false;
    let isOutside = false;
    const prevMouse = {};
    stage.interactive = true;
    stage.hitArea = new PIXI.Rectangle(0, 0, this.renderer.screen.width, this.renderer.screen.height);

    stage.mousedown = function(moveData) {
      const pos = moveData.data.global;
      Object.assign(prevMouse, pos);
      isDragging = true;
    };
    stage.mousemove = moveData => {
      if (!isDragging || isOutside) {
        return;
      }
      const currMouse = moveData.data.global;
      this.viewDataUpdate(prev => {
        return {
          x: Number(prev.x) + (currMouse.x - prevMouse.x),
          y: Number(prev.y) + (currMouse.y - prevMouse.y)
        };
      });

      Object.assign(prevMouse, currMouse);
    };
    stage.mouseout = () => (isOutside = true);
    stage.mouseover = () => (isOutside = false);
    stage.mouseup = stage.mouseupoutside = () => (isDragging = false);

    // Set up zooming on the viewport.  Viewport positioning and scale is controlled via props.setView()
    const globalMouse = new PIXI.Point(0, 0);
    this.renderer.view["addEventListener"](
      "wheel",
      e => {
        e.preventDefault();
        this.interactionManager.mapPositionToPoint(globalMouse, e.clientX, e.clientY);

        // sign of deltaY (-1,0,1) determines zoom in or out
        const factor = 1 - Math.sign(e.deltaY) * 0.03;
        this.viewDataUpdate(prev => {
          return {
            x: globalMouse.x - (globalMouse.x - prev.x) * factor,
            y: globalMouse.y - (globalMouse.y - prev.y) * factor,
            xScale: prev.xScale * factor,
            yScale: prev.yScale * factor
          };
        });
      },
      false
    );
  }
  update(props) {
    const { view } = props;
    this.viewport.position = new PIXI.Point(view.x, view.y);
    this.viewport.scale.x = view.xScale;
    this.viewport.scale.y = view.yScale;
    this.formationsUpdate(props.formations, props.surveys[props.surveys.length - 2]);
    this.wellPlanUpdate(props.wellPlan);
    this.surveyUpdate(props.surveys);
    this.projectionLineUpdate(props.projections);
    this.sectionUpdate(props);
    this.interactivePAUpdate(props);
    this.gridUpdate(props);
    this.newProps = true;
  }
  resize(width, height) {
    this.renderer.resize(width, height);
    this.stage.hitArea = new PIXI.Rectangle(0, 0, width, height);
  }
  cleanUp() {
    this.ticker.stop();
    removeAllChildren(this.formationsLayer);
    removeAllChildren(this.wellPathLayer);
    removeAllChildren(this.UILayer);
    removeAllChildren(this.gridLayer);
  }
}
