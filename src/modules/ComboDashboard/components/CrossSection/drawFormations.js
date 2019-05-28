import * as PIXI from "pixi.js";

/**
 * Add formation layers calculated from the formation data
 * @param container The PIXI container that will get the formations
 */
export function drawFormations(container) {
  let prevFormationsLength = 0;
  const formationGraphicsArray = [];

  const createTiles = function(layers) {
    layers.map(() => {
      let tile = new PIXI.Graphics();
      container.addChild(tile);
      return tile;
    });
  };

  return update;

  function update(props) {
    const { formations: layers, lastSurveyIdx } = props;
    if (!layers || !layers.length || layers.length === prevFormationsLength) return;
    prevFormationsLength = layers.length;
    // TODO: Handle updated formation data (for instance adjusting a projection point)
    for (let i = 0; i < layers.length - 1; i++) {
      if (!formationGraphicsArray[i]) {
        formationGraphicsArray[i] = createTiles(layers[i].data);
      }
      let currLayer = layers[i];
      let nextLayer = layers[i + 1];
      let { bg_color: bgColor, bg_percent: bgPercent } = currLayer;

      for (let j = 0; j < currLayer.data.length - 1; j++) {
        if (j >= lastSurveyIdx) {
          bgPercent = 0.3;
        }
        // Each formation tile is drawn from four points arranged like this:
        // p1  ->  p2
        //         |
        //         v
        // p4  <-  p3
        let p1 = currLayer.data[j];
        let p2 = currLayer.data[j + 1];
        let p3 = nextLayer.data[j + 1];
        let p4 = nextLayer.data[j];

        // The right side points determine the tile fault
        const a1 = [p1.vs, p1.tot + p2.fault];
        const a2 = [p2.vs, p2.tot];
        const a3 = [p3.vs, p3.tot];
        const a4 = [p4.vs, p4.tot + p3.fault];
        const tilePath = [...a1, ...a2, ...a3, ...a4];

        const p = new PIXI.Graphics();
        p.lineStyle(0).beginFill(Number(`0x${bgColor}`), bgPercent);
        p.drawPolygon(tilePath);
        p.closePath();
        container.addChild(p);
      }
    }
  }
}
