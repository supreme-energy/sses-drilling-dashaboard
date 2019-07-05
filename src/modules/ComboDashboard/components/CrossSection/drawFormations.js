import * as PIXI from "pixi.js";

/**
 * Add formation layers calculated from the formation data
 * @param container The PIXI container that will get the formations
 */
export function drawFormations(container) {
  const layerTiles = [];

  return update;

  function update(props) {
    const { calculatedFormations: layers, calcSections } = props;
    if (!layers || !layers.length) return;
    layerTiles.forEach(l => l.forEach(t => t.clear()));
    // TODO: Can optimize performance by redrawing only when data changes
    for (let layerIdx = 0; layerIdx < layers.length - 1; layerIdx++) {
      const currLayer = layers[layerIdx];
      const nextLayer = layers[layerIdx + 1];
      let { bg_color: currColor, bg_percent: currAlpha } = currLayer;

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
      }
    }
  }
}
