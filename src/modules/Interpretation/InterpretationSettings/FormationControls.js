import React from "react";
import css from "./styles.scss";
import { Box, IconButton, Typography, Button } from "@material-ui/core";
import { ArrowRightAlt, AddCircle } from "@material-ui/icons";
import { useFormationsDataContainer } from "../../App/Containers";
import { useFormationsStore } from "../InterpretationChart/Formations/store";

export default function FormationControls() {
  const { formationsData } = useFormationsDataContainer();
  const [{ selectedFormation }, dispatch] = useFormationsStore();
  const getSelectedIndex = () => formationsData.findIndex(d => d.id === selectedFormation);
  const navigate = direction => {
    if (!formationsData || !formationsData.length) {
      return;
    }
    const selectedIndex = getSelectedIndex();
    let nextIndex = selectedIndex + direction;

    if (nextIndex === formationsData.length) {
      nextIndex = 0;
    }

    if (nextIndex === -1) {
      nextIndex = formationsData.length - 1;
    }

    const nextId = formationsData[nextIndex].id;
    dispatch({ type: "CHANGE_SELECTION", formationId: nextId });
  };

  return (
    <Box display="flex" flexDirection="row" className={css.root} justifyContent="space-between" alignItems="center">
      <Box display="flex" alignItems="center" mr={1}>
        <IconButton disableRipple onClick={() => dispatch({ type: "CREATE_TOP" })}>
          <AddCircle />
        </IconButton>
        <Typography variant="caption">Add Top</Typography>
      </Box>
      <div>
        <IconButton disableRipple flex="none" onClick={() => navigate(1)} className={css.arrowButton}>
          <ArrowRightAlt className={css.arrowBottom} />
        </IconButton>
        <IconButton disableRipple flex="none" onClick={() => navigate(-1)} className={css.arrowButton}>
          <ArrowRightAlt className={css.arrowTop} />
        </IconButton>
      </div>
      <Button variant="outlined" color="primary" onClick={() => dispatch({ type: "TOGGLE_EDIT_MODE" })}>
        Done
      </Button>
    </Box>
  );
}
