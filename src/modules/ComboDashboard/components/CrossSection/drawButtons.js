import * as PIXI from "pixi.js";
import { frozenXTransform, frozenXYTransform } from "./customPixiTransforms";
import memoizeOne from "memoize-one";
import addCircleSVG from "../../../../assets/addCircle.svg";
import checkCircleSVG from "../../../../assets/checkCircle.svg";
import trashCircleSVG from "../../../../assets/deleteForever.svg";
import { ADD_PA_STATION, HISTORY, NORMAL } from "../../../../constants/crossSectionModes";

function addButton(container, texture) {
  const button = container.addChild(new PIXI.Sprite(texture));
  button.scale = new PIXI.Point(0.5, 0.5);
  button.interactive = true;
  button.cursor = "pointer";
  return button;
}

function drawButtons(container, props, gutter, tagHeight) {
  const { setMode } = props;
  const addCircleTexture = PIXI.Texture.from(addCircleSVG, { orig: new PIXI.Rectangle(0, 0, 40, 40) });
  const checkCircleTexture = PIXI.Texture.from(checkCircleSVG, { orig: new PIXI.Rectangle(0, 0, 40, 40) });
  const trashCircleTexture = PIXI.Texture.from(trashCircleSVG, { orig: new PIXI.Rectangle(0, 0, 40, 40) });

  const btnStage = container.addChild(new PIXI.Container());
  btnStage.transform.updateTransform = frozenXTransform;

  const addCircle = addButton(btnStage, addCircleTexture);
  addCircle.position.x = 15;
  addCircle.position.y = tagHeight - 20;
  const setAddCircleMemo = memoizeOne(setMode => {
    console.log("Setting action for addCircle circle");
    addCircle.on("click", () => {
      setMode(ADD_PA_STATION);
    });
  });

  const trashCircle = addButton(btnStage, trashCircleTexture);
  trashCircle.position.x = -35;
  trashCircle.position.y = tagHeight - 20;
  const setTrashCircleMemo = memoizeOne(action => {
    console.log("Setting action for trash circle");
    trashCircle.on("click", action);
  });

  const checkCircle = addButton(btnStage, checkCircleTexture);
  checkCircle.position.x = -10;
  checkCircle.position.y = tagHeight + 5;
  const setCheckActionMemo = memoizeOne((action, setMode) => {
    console.log("Setting action for bottom circle");
    checkCircle.on("click", () => {
      setMode(NORMAL);
      action();
    });
  });

  const setButtonPositions = memoizeOne(selectedPoint => {
    if (!selectedPoint) {
      checkCircle.visible = false;
      trashCircle.visible = false;
      addCircle.visible = true;
      addCircle.position.x = -10;
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

  return function update(props) {
    if (!container.transform) return;
    const { height, mode, setMode, calcSections, selectedSections, deselectMd } = props;
    if (!calcSections.length) return;
    const selectedPoint = calcSections.find(s => selectedSections[s.id]);
    const buttonX = selectedPoint ? selectedPoint.vs : calcSections[calcSections.length - 1].vs;
    if (mode === HISTORY) return;

    setCheckActionMemo(deselectMd, setMode);
    setAddCircleMemo(setMode);
    setButtonPositions(selectedPoint);
    btnStage.position.x = buttonX;
    btnStage.position.y = height - gutter;
  };
}

export { drawButtons };
