import React from "react";
import { Box, IconButton, Typography } from "@material-ui/core";
import { DeleteForever } from "@material-ui/icons";
import { useFormationsStore } from "./Formations/store";
import { useSelectedFormation } from "../selectors";
import { useFormationsDataContainer } from "../../App/Containers";
import withConfirmDelete from "../../../components/withConfirmDelete";

const ButtonWithConfirm = withConfirmDelete(IconButton);

export default function FormationSettings() {
  const [, dispatch] = useFormationsStore();
  const selectedFormation = useSelectedFormation();
  const { deleteTop } = useFormationsDataContainer();
  return (
    <Box display="flex" flexDirection="column">
      {selectedFormation && (
        <Box display="flex" flexDirection="row" justifyContent="space-between" alignItems="center">
          <div>
            <Typography variant="caption">Formation Top Label</Typography>
            <Typography variant="subtitle1">{selectedFormation.label}</Typography>
          </div>
          <ButtonWithConfirm disableRipple onConfirm={() => deleteTop(selectedFormation.id)}>
            <DeleteForever color="error" />
          </ButtonWithConfirm>
        </Box>
      )}
    </Box>
  );
}
