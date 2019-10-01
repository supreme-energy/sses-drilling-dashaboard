import React, { useCallback, useState, useReducer } from "react";
import { Card, CardContent, Typography, ListItem, List, ListItemText, ListItemIcon, Button } from "@material-ui/core";
import classes from "./WelcomeCard.scss";
import Add from "@material-ui/icons/Add";
import Import from "@material-ui/icons/Input";
import { useCreateWell } from "../../../../api";
import { useSelectedWellInfoContainer } from "../../../App/Containers";
import { BitDepth, Rop } from "../../../Kpi/KpiItem";
import { Link } from "react-router-dom";
import NewWellDialog from "./NewWellDialog";
import WellStatus from "../../../Kpi/WellStatus";
import ServerStatus from "../../../Kpi/ServerStatus";
import WellPathStatus from "../../../Kpi/WellPathStatus";
import classNames from "classnames";
import ImportInput from "../ImportInput";
import { useWellImporterSaveContainer } from "../../../../modals/WellImporterModal/WellImporterModal";
import useRef from "react-powertools/hooks/useRef";

const LastEditedWell = ({ lastEditedWell, openedWell }) => {
  const well = openedWell || lastEditedWell;

  return (
    <div>
      <Typography variant="subtitle1" gutterBottom>
        Last time you opened the well
      </Typography>
      <div>{well.name}</div>
      <Typography variant="body2" gutterBottom>
        {`${well.surfacePosition[0]}  |  ${well.surfacePosition[1]}`}
      </Typography>

      <div className={classes.row}>
        <WellStatus status={well.status} className={classes.status} />
        <span className={classes.hBigSpacer} />
        <WellPathStatus wellId={well.id} />
        <Link to={`/${well.id}/combo`}>
          <Button variant="contained" color="primary">
            {openedWell ? "Continue" : "Reopen"}
          </Button>
        </Link>
      </div>
      <div className={classes.row}>
        <Rop wellId={well.id} />
        <span className={classes.hBigSpacer} />
        <ServerStatus wellId={well.id} />
        <span className={classes.hBigSpacer} />
        <BitDepth wellId={well.id} />
      </div>
    </div>
  );
};

function WelcomeCard({
  theme,
  lastEditedWell,
  openedWell,
  className,
  onFilesToImportChange,
  changeSelectedWell,
  refreshWellList,
  setInitialTab
}) {
  const [createWellDialogOpen, setCreateWellDialog] = useState(false);
  const [wellName, setWellName] = useState("");
  const { createWell } = useCreateWell();
  const [, , updateWell, refreshFetchStore] = useSelectedWellInfoContainer();

  const handleOpenCreateWellDialog = useCallback(() => setCreateWellDialog(true), []);
  const handleCloseCreateWellDialog = useCallback(() => {
    setCreateWellDialog(false);
    setWellName("");
  }, []);
  const handleSetName = useCallback(e => setWellName(e.target.value), []);
  const [{ isSaved }] = useWellImporterSaveContainer();
  const internalState = useRef({ prevIsSaved: false });
  const {
    current: { prevIsSaved }
  } = internalState;

  if (prevIsSaved !== isSaved) {
    internalState.current.prevIsSaved = isSaved;
    if (isSaved && createWellDialogOpen) {
      // close dialog after save
      setCreateWellDialog(false);
    }
  }

  const handleCreateWell = useCallback(async () => {
    const res = await createWell(wellName);
    const wellId = res.jobname;
    // Refresh job list
    await refreshWellList();
    refreshFetchStore();
    // Update WellBoreName
    updateWell({ wellId, field: "wellborename", value: wellName });
    refreshFetchStore();
    // Close Dialog
    setCreateWellDialog(false);
    // Initialize view for new well
    changeSelectedWell(wellId);
    setInitialTab("info");
  }, [createWell, wellName, changeSelectedWell, refreshWellList, setInitialTab, updateWell, refreshFetchStore]);
  const [isImport, toggleIsImport] = useReducer(value => !value, false);

  return (
    <Card className={classNames(classes.card, className)}>
      <CardContent>
        <Typography variant="h4" gutterBottom color="primary">
          Welcome to Subsurface Geological Tracking Analysis
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Select an existing well by searching for a well, selecting from the list on the left, or the map below.
        </Typography>
        <div className={classes.cardContent}>
          <div>
            <List className={classes.list}>
              <ListItem className={classes.listItem} color="primary" onClick={handleOpenCreateWellDialog}>
                <ListItemIcon>
                  <div className={classes.iconBg} style={{ background: theme.palette.primary.main }}>
                    <Add />
                  </div>
                </ListItemIcon>
                <ListItemText>Create a new Well</ListItemText>
              </ListItem>
            </List>
          </div>
          <span className={classes.hSpacer} />
          {lastEditedWell || openedWell ? (
            <LastEditedWell lastEditedWell={lastEditedWell} openedWell={openedWell} />
          ) : null}
        </div>
      </CardContent>
      <NewWellDialog
        open={createWellDialogOpen}
        wellName={wellName}
        onFilesToImportChange={onFilesToImportChange}
        handleChange={handleSetName}
        handleClose={handleCloseCreateWellDialog}
        handleSave={handleCreateWell}
        isImport={isImport}
        toggleIsImport={toggleIsImport}
      />
    </Card>
  );
}

export default WelcomeCard;
