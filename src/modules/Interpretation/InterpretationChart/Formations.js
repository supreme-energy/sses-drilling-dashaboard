import React, { useMemo } from "react";
import PixiRectangle from "../../../components/PixiRectangle";
import { useFormationsDataContainer } from "../../App/Containers";
import PixiText from "../../../components/PixiText";

function Formation({ y, height, label, width, container, backgroundAlpha, backgroundColor, color }) {
  return (
    <React.Fragment>
      <PixiRectangle
        backgroundColor={backgroundColor}
        backgroundAlpha={backgroundAlpha}
        x={12}
        y={y}
        width={width}
        height={height}
        container={container}
      />
      <PixiText container={container} text={label} y={y} x={20} color={color} fontSize={11} />
    </React.Fragment>
  );
}

export default function Formations({ container, width }) {
  const { formationsData } = useFormationsDataContainer();

  const formations = useMemo(
    () =>
      formationsData.reduce((acc, item, index) => {
        if (item.data && item.data.length && index <= formationsData.length - 2) {
          const nextItem = formationsData[index + 1];
          acc.push({
            y: item.data[0].tot,
            height: nextItem.data[0].tot - item.data[0].tot,
            label: item.label,
            id: item.id,
            backgroundColor: Number(`0x${item.bg_color}`),
            backgroundAlpha: Number(item.bg_percent),
            color: Number(`0x${item.color}`)
          });
        }

        return acc;
      }, []),
    [formationsData]
  );

  return formations.map(f => <Formation container={container} width={width} {...f} key={f.id} />);
}
