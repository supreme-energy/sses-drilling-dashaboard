import React, { useMemo } from "react";
import { Box, IconButton, Typography, CircularProgress } from "@material-ui/core";
import { DeleteForever, Visibility, VisibilityOff } from "@material-ui/icons";
import { useFormationsStore } from "../Formations/store";
import { useSelectedFormation, getFormatinVisibilitySettings } from "../../selectors";
import { useFormationsDataContainer, useWellIdContainer } from "../../../App/Containers";
import withConfirmDelete from "../../../../components/withConfirmDelete";
import css from "./styles.scss";
import get from "lodash/get";
import { EMPTY_FIELD } from "../../../../constants/format";
import ColorPickerBox from "../../../../components/ColorPickerBox";
import { rgb } from "d3-color";
import classNames from "classnames";
import { NumericDebouceTextField } from "../../../../components/DebouncedInputs";

const ButtonWithConfirm = withConfirmDelete(IconButton);

const FormationColor = ({ label, ...props }) => (
  <Box display="flex" flexDirection="column" alignItems="center">
    <Typography variant="caption">{label}</Typography>
    <ColorPickerBox {...props} />
  </Box>
);

function SettingsContent({
  pendingAddTop,
  selectedFormation,
  formationsData,
  deleteTop,
  dispatch,
  updateTop,
  wellId,
  interpretationLine,
  interpretationFill,
  vsLine,
  vsFill
}) {
  const thickness = get(selectedFormation, "data[0].thickness");
  const selectionBgColor = `#${get(selectedFormation, "bg_color")}`;
  const selectionBgAlpha = Number(get(selectedFormation, "bg_percent"));

  const selectionBgColorObject = useMemo(() => ({ ...rgb(selectionBgColor), a: selectionBgAlpha }), [
    selectionBgColor,
    selectionBgAlpha
  ]);

  return pendingAddTop ? (
    <React.Fragment>
      <Typography variant="subtitle2">Add a Formation Top</Typography>
      <Typography variant="body2">
        Point and click the depth of your new formation top. You can drag the top up or down after adding it.
      </Typography>
    </React.Fragment>
  ) : selectedFormation ? (
    <Box display="flex" flexDirection="column">
      <Box display="flex" flexDirection="row" justifyContent="space-between" alignItems="center">
        <div>
          <Typography variant="caption">Formation Top Label</Typography>
          <Typography variant="subtitle1">{selectedFormation.label}</Typography>
        </div>
        <ButtonWithConfirm
          disableRipple
          onConfirm={() => {
            const remainingFormations = formationsData.filter(f => f.id !== selectedFormation.id);
            const nextSelected = get(remainingFormations, "[0].id");
            deleteTop(selectedFormation.id);
            dispatch({
              type: "DELETE_FORMATION",
              id: selectedFormation.id,
              nextId: nextSelected
            });
          }}
        >
          <DeleteForever color="error" />
        </ButtonWithConfirm>
      </Box>
      <div className={css.headerGrid}>
        <div className={classNames(css.col1, css.row1)}>
          <NumericDebouceTextField
            value={thickness}
            onChange={value => updateTop({ id: selectedFormation.id, thickness: value })}
            placeholder={EMPTY_FIELD}
            label={"Thickness"}
            className={"hideArrows"}
            inputProps={{ className: css.thicknessInput }}
            margin="dense"
            InputLabelProps={{
              shrink: true
            }}
          />
        </div>

        <FormationColor
          hex={`#${selectedFormation.color}`}
          color={`#${selectedFormation.color}`}
          label={"Line"}
          boxProps={{ className: classNames(css.colorBox, css.col2, css.row1) }}
          handleSave={({ hex }) => updateTop({ id: selectedFormation.id, color: hex.replace("#", "") })}
        />

        <FormationColor
          hex={`#${selectedFormation.bg_color}`}
          color={selectionBgColorObject}
          label={"Fill"}
          boxProps={{ className: classNames(css.colorBox, css.col3, css.row1) }}
          handleSave={color =>
            updateTop({ id: selectedFormation.id, bg_color: color.hex.replace("#", ""), bg_percent: color.rgb.a })
          }
        />

        <Typography className={classNames(css.col1, css.row2, css.visibilityText)} variant="caption">
          Interpretation-
        </Typography>

        <Typography className={classNames(css.col1, css.row3, css.visibilityText)} variant="caption">
          Vertical Section-
        </Typography>

        <div className={classNames(css.col2, css.row2)}>
          <IconButton
            size="small"
            disableRipple
            onClick={() =>
              dispatch({
                type: "CHANGE_FORMATION_VISIBILITY",
                wellId,
                topId: selectedFormation.id,
                interpretationLine: !interpretationLine
              })
            }
          >
            {interpretationLine ? <Visibility /> : <VisibilityOff />}
          </IconButton>
        </div>

        <div className={classNames(css.col2, css.row3)}>
          <IconButton
            size="small"
            disableRipple
            onClick={() =>
              dispatch({
                type: "CHANGE_FORMATION_VISIBILITY",
                wellId,
                topId: selectedFormation.id,
                vsLine: !vsLine
              })
            }
          >
            {vsLine ? <Visibility /> : <VisibilityOff />}
          </IconButton>
        </div>

        <div className={classNames(css.col3, css.row2)}>
          <IconButton
            size="small"
            disableRipple
            onClick={() =>
              dispatch({
                type: "CHANGE_FORMATION_VISIBILITY",
                wellId,
                topId: selectedFormation.id,
                interpretationFill: !interpretationFill
              })
            }
          >
            {interpretationFill ? <Visibility /> : <VisibilityOff />}
          </IconButton>
        </div>

        <div className={classNames(css.col3, css.row3)}>
          <IconButton
            size="small"
            disableRipple
            onClick={() =>
              dispatch({
                type: "CHANGE_FORMATION_VISIBILITY",
                wellId,
                topId: selectedFormation.id,
                vsFill: !vsFill
              })
            }
          >
            {vsFill ? <Visibility /> : <VisibilityOff />}
          </IconButton>
        </div>
      </div>
    </Box>
  ) : null;
}

export default function FormationSettings() {
  const [{ pendingAddTop, addTopLoading, formationVisibilityByWellAndTop }, dispatch] = useFormationsStore();
  const selectedFormation = useSelectedFormation();
  const { formationsData } = useFormationsDataContainer();
  const { wellId } = useWellIdContainer();

  const { deleteTop, updateTop } = useFormationsDataContainer();
  const settingsProps = {
    deleteTop,
    formationsData,
    selectedFormation,
    dispatch,
    pendingAddTop,
    updateTop,
    wellId,
    ...getFormatinVisibilitySettings(formationVisibilityByWellAndTop, wellId, selectedFormation && selectedFormation.id)
  };

  return (
    <Box display="flex" flexDirection="column" className={css.root}>
      {addTopLoading ? <CircularProgress /> : <SettingsContent {...settingsProps} />}
    </Box>
  );
}
