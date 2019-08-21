import * as PIXI from "pixi.js";
import { frozenScaleTransform, frozenXTransform } from "./customPixiTransforms";
import memoizeOne from "memoize-one";
import addCircleSVG from "../../../../assets/addCircle.svg";
import checkCircleSVG from "../../../../assets/checkCircle.svg";
import trashCircleSVG from "../../../../assets/deleteForever.svg";
import { ADD_PA_STATION, NORMAL } from "../../../../constants/crossSectionModes";
import _ from "lodash";
import { toRadians } from "./formulas";

function addButton(container, texture) {
  const button = container.addChild(new PIXI.Sprite(texture));
  button.scale = new PIXI.Point(0.5, 0.5);
  button.interactive = true;
  button.cursor = "pointer";
  return button;
}

function drawButtons(container, stage, props, gutter, tagHeight) {
  const { setMouse, setMode, deselectMd } = props;
  let latestProps = props;
  let lastMode = props.mode;
  const addCircleTexture = PIXI.Texture.from(addCircleSVG, { orig: new PIXI.Rectangle(0, 0, 40, 40) });
  const checkCircleTexture = PIXI.Texture.from(checkCircleSVG, { orig: new PIXI.Rectangle(0, 0, 40, 40) });
  const trashCircleTexture = PIXI.Texture.from(trashCircleSVG, { orig: new PIXI.Rectangle(0, 0, 40, 40) });

  const btnStage = container.addChild(new PIXI.Container());
  btnStage.transform.updateTransform = frozenXTransform;

  const mouseListener = container.addChild(new PIXI.Container());
  mouseListener.transform.updateTransform = frozenScaleTransform;

  const addCircle = addButton(btnStage, addCircleTexture);
  addCircle.position.x = 15;
  addCircle.position.y = tagHeight - 20;
  addCircle.on("click", () => {
    deselectMd();
    setMode(ADD_PA_STATION);
  });

  const trashCircle = addButton(btnStage, trashCircleTexture);
  trashCircle.position.x = -35;
  trashCircle.position.y = tagHeight - 20;
  trashCircle.on("click", () => {
    const { deleteProjection, calcSections, selectedSections } = latestProps;
    console.log(deleteProjection, calcSections, selectedSections);
    const selectedPoint = calcSections.find(s => selectedSections[s.id]);
    deleteProjection(selectedPoint.id);
  });

  const checkCircle = addButton(btnStage, checkCircleTexture);
  checkCircle.position.x = -10;
  checkCircle.position.y = tagHeight + 5;
  checkCircle.on("click", () => {
    setMode(NORMAL);
    deselectMd();
  });

  const paIndicator = container.addChild(new PIXI.Container());
  paIndicator.transform.updateTransform = frozenXTransform;
  paIndicator.visible = false;

  const paLine = paIndicator.addChild(new PIXI.Graphics());
  paLine.transform.updateTransform = frozenXTransform;

  const paHintText = paIndicator.addChild(
    new PIXI.Text("Click to add a PA station here", { fill: "#e21", fontSize: 12 })
  );
  paHintText.anchor.set(0.5, 0);
  paHintText.position.x = 0;

  const labelBG = paIndicator.addChild(new PIXI.Graphics());
  labelBG.position.x = -10;
  labelBG.clear().beginFill(0xee2211, 0.5);
  labelBG.drawRoundedRect(0, 0, 20, tagHeight, 5);

  const labelText = labelBG.addChild(new PIXI.Text("", { fill: "#fff", fontSize: 16 }));
  labelText.anchor.set(0.5, 1);
  labelText.rotation = Math.PI / 2;
  labelText.position.y = tagHeight / 2;

  const setButtonPositions = memoizeOne((selectedPoint, mode) => {
    if (!selectedPoint) {
      checkCircle.visible = false;
      trashCircle.visible = false;
      if (mode === ADD_PA_STATION) {
        addCircle.visible = false;
      } else {
        addCircle.visible = true;
        addCircle.position.x = -10;
      }
    } else if (selectedPoint.isProjection) {
      checkCircle.visible = true;
      trashCircle.visible = true;
      addCircle.visible = true;
      addCircle.position.x = 15;
    } else {
      checkCircle.visible = true;
      trashCircle.visible = false;
      addCircle.visible = false;
    }
  });

  function updateMouse(e) {
    setMouse({ ...e.data.global });
  }

  function stageClick(e) {
    const { calcSections } = latestProps;
    const vs = (latestProps.mouse.x - latestProps.view.x) / latestProps.view.xScale;
    const prev = _.findLast(calcSections, s => s.vs < vs) || calcSections[calcSections.length - 1];
    const newMd = prev.md + (vs - prev.vs) / Math.sin(toRadians(prev.inc));
    const newId = "newPA" + calcSections.length;

    latestProps.addProjection({
      ..._.pick(prev, ["method", "inc", "azm", "dip", "fault", "tvd", "tot", "bot"]),
      id: newId,
      md: newMd,
      vs: vs,
      ..._.mapKeys(_.pick(prev, ["md", "inc", "azm", "tvd", "ca", "cd"]), (value, key) => `p${key}`)
    });
    setMode(NORMAL);
    mouseListener.off("mousemove", updateMouse);
    stage.off("click", stageClick);
  }

  return function update(props) {
    const { height, mode, calcSections, selectedSections, mouse, view } = props;
    latestProps = props;
    if (!container.transform) return;
    if (!calcSections.length) return;

    paIndicator.visible = false;

    const modeChanged = lastMode !== mode;
    const selectedPoint = calcSections.find(s => selectedSections[s.id]);
    const bitProjVs = (calcSections.find(s => s.isBitProj) || {}).vs || 0;
    const paIndicatorX = Math.max(bitProjVs, (mouse.x - view.x) / view.xScale);
    const buttonX = selectedPoint ? selectedPoint.vs : calcSections[calcSections.length - 1].vs;

    setButtonPositions(selectedPoint, mode);
    btnStage.position.x = buttonX;
    btnStage.position.y = height - gutter;

    if (mode === ADD_PA_STATION) {
      if (modeChanged) {
        mouseListener.interactive = true;
        mouseListener.on("mousemove", updateMouse);
        stage.on("click", stageClick);
      }
      paIndicator.visible = true;
      paIndicator.position.x = paIndicatorX;
      labelText.text = `${paIndicatorX.toFixed(2)}`;
      paIndicator.position.y = height - gutter;
      paHintText.position.y = -(height - gutter);
      paLine.clear().lineStyle(2, 0xee2211, 0.5);
      paLine.moveTo(0, 15).lineTo(0, height - gutter);
    }

    lastMode = mode;
  };
}

export { drawButtons };
