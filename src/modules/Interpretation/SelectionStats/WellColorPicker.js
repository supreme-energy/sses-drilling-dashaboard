import React, { useCallback } from "react";
import { useWellIdContainer, useSelectedWellInfoContainer } from "../../App/Containers";
import ColorPickerBox from "../../../components/ColorPickerBox";
import css from "./styles.scss";
import { useSelectedWellInfoColors } from "../selectors";
import useMemo from "react-powertools/hooks/useMemo";

export default function WellColorPicker({ field, boxProps, ...props }) {
  const { wellId } = useWellIdContainer();
  const [, , updateWell] = useSelectedWellInfoContainer();
  const colors = useSelectedWellInfoColors();
  const color = colors[field];
  const handleSave = useCallback(
    value => {
      updateWell({ wellId, field, value: value.replace("#", "") });
    },
    [updateWell, field, wellId]
  );

  return (
    <ColorPickerBox
      hex={`#${color}`}
      color={`#${color}`}
      boxProps={useMemo(() => ({ className: css.colorBox, ...boxProps }), [boxProps])}
      handleSave={handleSave}
      {...props}
    />
  );
}

WellColorPicker.defaultProps = {
  boxProps: {}
};
