import React from "react";
import css from "./styles.scss";
import { Box, IconButton } from "@material-ui/core";
import { ArrowRightAlt } from "@material-ui/icons";
import { useFormationsDataContainer } from "../../App/Containers";
import { useFormationsStore } from "../InterpretationChart/Formations/store";

export default function FormationSettings() {
  const { formationsData } = useFormationsDataContainer();
  const [{ selectedFormation }, dispatch] = useFormationsStore();
  const getSelectedIndex = () => formationsData.findIndex(d => d.id === selectedFormation);
  const navigate = direction => {
    if (!formationsData || !formationsData.length) {
      return;
    }
    const selectedIndex = getSelectedIndex();
    let nextIndex = selectedIndex + direction;
    // last formation top is not a segment?
    if (nextIndex === formationsData.length) {
      nextIndex = 0;
    }

    if (nextIndex === -1) {
      nextIndex = formationsData.length - 1;
    }

    console.log(formationsData[nextIndex]);
    const nextId = formationsData[nextIndex].id;
    dispatch({ type: "TOGGLE_SELECTION", formationId: nextId });
  };

  return (
    <Box display="flex" flexDirection="row" className={css.root}>
      <IconButton disableRipple onClick={() => navigate(1)} className={css.arrowButton}>
        <ArrowRightAlt className={css.arrowBottom} />
      </IconButton>
      <IconButton disableRipple onClick={() => navigate(-1)} className={css.arrowButton}>
        <ArrowRightAlt className={css.arrowTop} />
      </IconButton>
    </Box>
  );
}
