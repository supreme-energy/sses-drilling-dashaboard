import React from "react";
import { useWellIdContainer, useSelectedWellInfoContainer } from "../../App/Containers";
import ColorPickerBox from "../../../components/ColorPickerBox";
import css from "./styles.scss";
import { useSelectedWellInfoColors } from "../selectors";

export default function WellColorPicker({ field, boxProps, ...props }) {
  const { wellId } = useWellIdContainer();
  const [, , updateWell] = useSelectedWellInfoContainer();
  const colors = useSelectedWellInfoColors();
  const color = colors[field];
  return (
    <ColorPickerBox
      hex={`#${color}`}
      color={`#${color}`}
      boxProps={{ className: css.colorBox, ...boxProps }}
      handleSave={value => {
        updateWell({ wellId, field, value: value.replace("#", "") });
      }}
      {...props}
    />
  );
}

WellColorPicker.defaultProps = {
  boxProps: {}
};
