import * as PIXI from "pixi.js";
import { drawFormations } from "./drawFormations";
import { drawSurveys } from "./drawSurveys";
import { drawWellPlan } from "./drawWellPlan";
import { drawGrid } from "./drawGrid.js";
import { drawSections } from "./drawSections";
import { interactiveProjection } from "./interactiveProjection";
import { removeAllChildren } from "./pixiUtils";
import { drawButtons } from "./drawButtons";
import { VERTICAL } from "../../../../constants/crossSectionViewDirection";
import { drawCompass } from "./drawCompass";
import { getZoomRate } from "../../../../hooks/useViewport";

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
    this.viewport = this.stage.addChild(new PIXI.Container());
    // Set up PIXI classes for rendering and draw layers
    this.formationsLayer = this.viewport.addChild(new PIXI.Container());
    this.tclLineLayer = this.viewport.addChild(new PIXI.Container());
    this.wellPathLayer = this.viewport.addChild(new PIXI.Container());
    this.UILayer = this.viewport.addChild(new PIXI.Container());
    this.gridLayer = this.viewport.addChild(new PIXI.Container());
    this.UILayer2 = this.viewport.addChild(new PIXI.Container());
    this.compassLayer = this.viewport.addChild(new PIXI.Container());

    this.makeInteractive(this.stage);
  }
  init(props, viewData, viewDataUpdate) {
    this.viewDataUpdate = viewDataUpdate;
    const gridGutter = 100;
    const gridGutterLeft = 40;
    const tagHeight = 75;
    this.yTicks = 20;

    this.formationsUpdate = drawFormations(this.formationsLayer);
    this.wellPlanUpdate = drawWellPlan(this.wellPathLayer, props.wellPlan);
    this.surveyUpdate = drawSurveys(this.wellPathLayer);
    this.sectionUpdate = drawSections(this.UILayer, this.UILayer2, props, gridGutter, tagHeight);
    this.interactivePAUpdate = interactiveProjection(this.UILayer, props);
    if (!props.isReadOnly) {
      this.buttonUpdate = drawButtons(this.UILayer2, this.stage, props, gridGutter, tagHeight);
    }
    this.gridUpdate = drawGrid(this.gridLayer, {
      gutter: gridGutter,
      gutterLeft: gridGutterLeft,
      maxYLines: this.yTicks,
      fontSize: 13
    });
    this.compassUpdate = drawCompass(this.compassLayer);

    // The ticker is used for render timing, what's done on each frame, etc
    this.ticker = PIXI.Ticker.shared;
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
          ...prev,
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

        const zoomRate = getZoomRate(e);
        // sign of deltaY (-1,0,1) determines zoom in or out
        const factor = 1 - Math.sign(e.deltaY) * zoomRate;
        this.viewDataUpdate(prev => {
          return {
            ...prev,
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
    const { width, height, view, viewDirection } = props;
    this.viewport.position = new PIXI.Point(view.x, view.y);
    this.viewport.scale.x = view.xScale;
    this.viewport.scale.y = view.yScale;
    if (viewDirection === VERTICAL) {
      this.formationsLayer.visible = true;
      this.UILayer.visible = true;
      this.UILayer2.visible = true;
      this.compassLayer.visible = false;

      this.formationsUpdate(props);
      this.sectionUpdate(props);
      this.interactivePAUpdate(props);
      !props.isReadOnly && this.buttonUpdate(props);
    } else {
      this.formationsLayer.visible = false;
      this.UILayer.visible = false;
      this.UILayer2.visible = false;
      this.compassLayer.visible = true;

      this.compassUpdate(props);
    }

    this.wellPlanUpdate(props);
    this.surveyUpdate(props);
    this.gridUpdate(props, { maxXTicks: (this.yTicks * width) / height });
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
    removeAllChildren(this.UILayer2);
    removeAllChildren(this.gridLayer);
    removeAllChildren(this.compassLayer);
  }
}
