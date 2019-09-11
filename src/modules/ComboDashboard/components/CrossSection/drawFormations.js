import * as PIXI from "pixi.js";
import { frozenXYTransform } from "./customPixiTransforms";

function makeLabelTag(container, text, color) {
  let lastColor = color;
  const tagDot = container.addChild(new PIXI.Graphics());
  const tagLine = tagDot.addChild(new PIXI.Graphics());
  tagDot.transform.updateTransform = frozenXYTransform;
  const label = tagDot.addChild(new PIXI.Text(text, { fontSize: 13, fill: `#${color}` }));
  label.anchor.set(1, 0.5);
  label.position.x = -12;
  function drawTag(color) {
    tagDot.beginFill(Number(`0x${color}`), 0.8);
    tagDot.drawCircle(0, 0, 4);
    tagLine.lineStyle(3, Number(`0x${color}`), 0.8);
    tagLine.moveTo(-4, 0).lineTo(-10, 0);
  }
  drawTag(color);

  return {
    setPosition: function(x, y) {
      tagDot.x = x;
      tagDot.y = y;
    },
    setText: function(text) {
      if (text !== label.text) label.text = text;
    },
    setColor: function(color) {
      if (lastColor !== color) {
        lastColor = color;
        label.style = { fontsize: 13, fill: `#${color}` };
        drawTag(color);
      }
    }
  };
}
/**
 * Add formation layers calculated from the formation data
 * @param container The PIXI container that will get the formations
 */
export function drawFormations(container) {
  const layerTiles = [];
  const layerLines = [];
  const layerLabels = [];

  return function update(props) {
    const { calculatedFormations: layers, calcSections, scale } = props;
    if (!layers || !layers.length) return;
    layerTiles.forEach(l => l.forEach(t => t.clear()));
    layerLines.forEach(l => l.clear());
    // TODO: Can optimize performance by redrawing only when data changes
    for (let layerIdx = 0; layerIdx < layers.length - 1; layerIdx++) {
      const currLayer = layers[layerIdx];
      const nextLayer = layers[layerIdx + 1];
      let {
        bg_color: currColor,
        bg_percent: currAlpha,
        show_line: showLineYN,
        color: lineColor,
        data = []
      } = currLayer;
      const showLine = showLineYN.toUpperCase() === "YES";

      if (!layerLines[layerIdx]) {
        layerLines[layerIdx] = container.addChild(new PIXI.Graphics());
        layerLines[layerIdx].transform.updateTransform = frozenXYTransform;
      }
      layerLines[layerIdx].lineStyle(1, parseInt(lineColor, 16), 1);

      if (!layerLabels[layerIdx]) {
        layerLabels[layerIdx] = makeLabelTag(container, currLayer.label, currColor);
      }
      const pointOne = data[0];
      const pointTwo = data[1] || {};
      if (pointOne) {
        layerLabels[layerIdx].setPosition(...scale(pointOne.vs, pointOne.tot + (pointTwo.fault || 0)));
        layerLabels[layerIdx].setColor(currColor);
        layerLabels[layerIdx].setText(currLayer.label);
      }

      for (let pointIdx = 0; pointIdx < currLayer.data.length - 1; pointIdx++) {
        if (!layerTiles[layerIdx]) layerTiles[layerIdx] = [];
        if (!layerTiles[layerIdx][pointIdx]) {
          layerTiles[layerIdx][pointIdx] = container.addChild(new PIXI.Graphics());
        }
        const drawEndpoint = calcSections[pointIdx + 1];
        if (drawEndpoint && drawEndpoint.isProjection) {
          currAlpha = 0.3;
        }
        // Each formation tile is drawn from four points arranged like this:
        // p1  ->  p2
        //         |
        //         v
        // p4  <-  p3
        const p1 = currLayer.data[pointIdx];
        const p2 = currLayer.data[pointIdx + 1];
        const p3 = nextLayer.data[pointIdx + 1];
        const p4 = nextLayer.data[pointIdx];

        if (!p1 || !p2 || !p3 || !p4) continue;
        // The right side points determine the tile fault
        const a1 = [p1.vs, p1.tot + p2.fault];
        const a2 = [p2.vs, p2.tot];
        const a3 = [p3.vs, p3.tot];
        const a4 = [p4.vs, p4.tot + p3.fault];
        const tilePath = [...a1, ...a2, ...a3, ...a4];

        const tile = layerTiles[layerIdx][pointIdx];
        tile.beginFill(Number(`0x${currColor}`), currAlpha);
        tile.drawPolygon(tilePath);

        if (showLine) {
          const line = layerLines[layerIdx];
          line.moveTo(...scale(p1.vs, p1.tot + p2.fault));
          line.lineTo(...scale(p2.vs, p2.tot));
        }
      }
    }
  };
}
