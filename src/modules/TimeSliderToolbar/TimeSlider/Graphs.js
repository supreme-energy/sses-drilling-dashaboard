import React from "react";
import PropTypes from "prop-types";

import PixiContainer from "../../WellExplorer/components/WellOverview/ROP/PixiContainer";
import PixiRectangle from "../../WellExplorer/components/WellOverview/ROP/PixiRectangle";
import PixiLine from "../../WellExplorer/components/WellOverview/ROP/PixiLine";
import { LINE_GRAPHS, COLOR_BY_GRAPH } from "../../../constants/timeSlider";
import { mapRop, mapSlide } from "./TimeSliderUtil";

const TimeSliderGraphs = React.memo(({ data, viewportContainer, stage, selectedMenuItems, viewport }) => {
  return (
    <div>
      <PixiContainer ref={viewportContainer} container={stage} />
      {selectedMenuItems.map(graph => {
        if (LINE_GRAPHS.includes(graph)) {
          return (
            <PixiContainer
              key={graph}
              container={viewport}
              child={container => (
                <PixiLine
                  container={container}
                  data={data}
                  mapData={graph === "ROP" ? mapRop : mapSlide}
                  color={parseInt("0x" + COLOR_BY_GRAPH[graph])}
                />
              )}
            />
          );
        } else {
          // TODO Implement based on real data
          return (
            <PixiContainer
              key={graph}
              container={viewport}
              child={container =>
                data.map((data, barIndex) => {
                  if (barIndex % 131 === 0) {
                    return (
                      <PixiRectangle
                        key={barIndex}
                        container={container}
                        x={100 * barIndex + 100}
                        y={0}
                        width={50}
                        height={9000}
                        backgroundColor={parseInt("0x" + COLOR_BY_GRAPH[graph])}
                      />
                    );
                  }
                })
              }
            />
          );
        }
      })}
    </div>
  );
});

TimeSliderGraphs.propTypes = {
  viewportContainer: PropTypes.object,
  selectedMenuItems: PropTypes.arrayOf(PropTypes.string),
  viewport: PropTypes.object,
  stage: PropTypes.object,
  data: PropTypes.arrayOf(
    PropTypes.shape({
      ROP_I: PropTypes.number,
      ROP_A: PropTypes.number,
      Date_Time: PropTypes.string,
      Hole_Depth: PropTypes.number,
      TVD: PropTypes.number,
      A_interval: PropTypes.string
    })
  )
};

export default TimeSliderGraphs;
