import React from "react";
import { Box, IconButton, Typography, CircularProgress } from "@material-ui/core";
import { DeleteForever } from "@material-ui/icons";
import { useFormationsStore } from "../Formations/store";
import { useSelectedFormation } from "../../selectors";
import { useFormationsDataContainer } from "../../../App/Containers";
import withConfirmDelete from "../../../../components/withConfirmDelete";
import css from "./styles.scss";
import get from "lodash/get";

const ButtonWithConfirm = withConfirmDelete(IconButton);

function SettingsContent({ pendingAddTop, selectedFormation, formationsData, deleteTop, dispatch }) {
  return pendingAddTop ? (
    <React.Fragment>
      <Typography variant="subtitle2">Add a Formation Top</Typography>
      <Typography variant="body2">
        Point and click the depth of your new formation top. You can drag the top up or down after adding it.
      </Typography>
    </React.Fragment>
  ) : selectedFormation ? (
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
  ) : null;
}

export default function FormationSettings() {
  const [{ pendingAddTop, addTopLoading }, dispatch] = useFormationsStore();
  const selectedFormation = useSelectedFormation();
  const { formationsData } = useFormationsDataContainer();

  const { deleteTop } = useFormationsDataContainer();

  const settingsProps = {
    deleteTop,
    formationsData,
    selectedFormation,
    dispatch,
    pendingAddTop
  };

  console.log("addTopLoading", addTopLoading);
  return (
    <Box display="flex" flexDirection="column" className={css.root}>
      {addTopLoading ? <CircularProgress /> : <SettingsContent {...settingsProps} />}
    </Box>
  );
}
