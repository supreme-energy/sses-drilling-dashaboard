import * as PIXI from "pixi.js";

/**
 * Add formation layers calculated from the formation data
 * @param container The PIXI container that will get the formations
 */
export function drawFormations(container) {
  const layerTiles = [];

  const createTiles = function(points) {
    return points.map(() => {
      let tile = new PIXI.Graphics();
      container.addChild(tile);
      return tile;
    });
  };

  return update;

  function update(props) {
    const { calculatedFormations: layers, lastSurveyIdx } = props;
    if (!layers || !layers.length) return;
    // TODO: Handle updated formation data (for instance adjusting a projection point)
    for (let layerIdx = 0; layerIdx < layers.length - 1; layerIdx++) {
      let currLayer = layers[layerIdx];
      let nextLayer = layers[layerIdx + 1];
      let { bg_color: currColor, bg_percent: currAlpha } = currLayer;
      if (!layerTiles[layerIdx]) {
        layerTiles[layerIdx] = createTiles(currLayer.data);
      }

      for (let pointIdx = 0; pointIdx < currLayer.data.length - 1; pointIdx++) {
        if (pointIdx >= lastSurveyIdx) {
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

        // The right side points determine the tile fault
        const a1 = [p1.vs, p1.tot + p2.fault];
        const a2 = [p2.vs, p2.tot];
        const a3 = [p3.vs, p3.tot];
        const a4 = [p4.vs, p4.tot + p3.fault];
        const tilePath = [...a1, ...a2, ...a3, ...a4];

        const p = layerTiles[layerIdx][pointIdx];
        p.clear()
          .lineStyle(0)
          .beginFill(Number(`0x${currColor}`), currAlpha);
        p.drawPolygon(tilePath);
        p.closePath();
      }
    }
  }
}
