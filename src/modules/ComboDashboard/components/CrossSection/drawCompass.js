import * as PIXI from "pixi.js";
import { frozenXYTransform } from "./customPixiTransforms";
import compassSVG from "../../assets/compass.svg";

export function drawCompass(container) {
  const compassTexture = PIXI.Texture.from(compassSVG);
  const compass = container.addChild(new PIXI.Sprite(compassTexture));
  compass.transform.updateTransform = frozenXYTransform;
  compass.anchor.set(0.5, 0.5);
  compass.scale.x = 0.5;
  compass.scale.y = 0.5;
  compass.y = 30;

  return function update(props) {
    const { width } = props;
    compass.x = width - 50;
  };
}
