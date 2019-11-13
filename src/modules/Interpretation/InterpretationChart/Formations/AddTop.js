import React, { useState, useEffect, useMemo } from "react";
import { useInterpretationRenderer, gridGutter } from "..";
import { useFormationsStore } from "./store";
import PixiLine from "../../../../components/PixiLine";
import { formationTopsSelectedColor } from "../../pixiColors";
import * as PIXI from "pixi.js";
import PixiContainer from "../../../../components/PixiContainer";
import { frozenScaleTransform } from "../../../ComboDashboard/components/CrossSection/customPixiTransforms";
import { LabelDepth } from "./FormationSegments";
import { noDecimals } from "../../../../constants/format";
import useRef from "react-powertools/hooks/useRef";
import { useComputedSurveysAndProjections } from "../../selectors";
import uniqueId from "lodash/uniqueId";
import get from "lodash/get";

export default function AddTop({ addTop, formationData, tcl }) {
  const {
    stage,
    size: { width, height },
    view,
    refresh
  } = useInterpretationRenderer();
  const [, dispatch] = useFormationsStore();
  const [surveysAndProjections] = useComputedSurveysAndProjections();

  const [y, setY] = useState(0);
  const addLineData = useMemo(() => [[gridGutter, 0], [width, 0]], [width]);
  const containerRef = useRef(null);
  const internalState = useRef(() => ({}));

  internalState.current.onClick = function onClick() {
    const thickness = (-view.y + y) / view.yScale - tcl;
    const optimisticData = surveysAndProjections.map((s, index) => ({
      id: `pendingFormationData${index}`,
      thickness,
      vs: s.vs,
      fault: s.fault,
      md: s.md
    }));
    const pendingId = uniqueId();

    addTop({
      pendingId,
      thickness,
      optimisticData
    })
      .then(result => {
        dispatch({ type: "CREATE_TOP_SUCCESS", pendingId, id: result.id });
      })
      .catch(() => {
        const nextSelected = get(formationData, "[0].id");
        dispatch({ type: "CREATE_TOP_ERROR", pendingId, nextId: nextSelected });
      });

    dispatch({ type: "PENDING_TOP_CREATED", pendingId });
  };

  useEffect(
    function makeInteractive() {
      const container = containerRef.current.container;
      if (container) {
        container.interactive = true;
        container.hitArea = new PIXI.Rectangle(0, 0, width, height);
      }
    },
    [width, height, stage]
  );

  useEffect(
    function addMouseMoveListeners() {
      const container = containerRef.current.container;
      function onMouseMove(event) {
        setY(event.data.global.y);
      }

      if (container) {
        container.on("mousemove", onMouseMove);
      }

      return () => {
        if (container) {
          container.off("mousemove", onMouseMove);
        }
      };
    },
    [setY]
  );

  useEffect(function addKeyboardEvents() {
    const onKeyDown = e => {
      if (e.code === "Escape") {
        dispatch({ type: "CREATE_TOP_CANCELED" });
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => document.removeEventListener("keydown", onKeyDown);
  });

  const onClick = internalState.current.onClick;
  useEffect(refresh, [y, onClick]);

  return (
    <PixiContainer
      updateTransform={frozenScaleTransform}
      onClick={onClick}
      ref={containerRef}
      container={stage}
      child={container => (
        <PixiContainer
          y={y}
          onClick={onClick}
          container={container}
          child={container => (
            <React.Fragment>
              <PixiLine
                container={container}
                data={addLineData}
                color={formationTopsSelectedColor}
                lineWidth={2}
                nativeLines={false}
              />
              <LabelDepth
                refresh={refresh}
                container={container}
                backgroundColor={formationTopsSelectedColor}
                y={0}
                x={gridGutter}
                text={noDecimals((-view.y + y) / view.yScale)}
              />
            </React.Fragment>
          )}
        />
      )}
    />
  );
}
