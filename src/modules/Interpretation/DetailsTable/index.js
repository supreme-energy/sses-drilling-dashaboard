import React, { useReducer } from "react";
import { TableButton } from "../../../components/TableButton";
import {
  Dialog,
  DialogTitle,
  IconButton,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box
} from "@material-ui/core";
import { Close } from "@material-ui/icons";
import css from "./styles.scss";
import { useComputedFilteredWellData } from "../../App/Containers";
import { useSelectedFormation } from "../selectors";
import classNames from "classnames";
import useMemo from "react-powertools/hooks/useMemo";
import { twoDecimals } from "../../../constants/format";
import { useFormationsStore } from "../InterpretationChart/Formations/store";

export default function DetailsTable() {
  const [modalOpened, toggleModal] = useReducer(s => !s, false);

  const { formations: filteredFormationsData, surveys, projections } = useComputedFilteredWellData();
  const [{ editMode }] = useFormationsStore();
  const selectedFormation = useSelectedFormation();
  const showPopup = editMode && modalOpened && selectedFormation;
  const filteredSelectedFormation = useMemo(
    () => showPopup && filteredFormationsData.find(f => f.id === selectedFormation.id),
    [selectedFormation, filteredFormationsData, showPopup]
  );

  return (
    <React.Fragment>
      {editMode && selectedFormation && <TableButton onClick={toggleModal} />}
      {showPopup && (
        <Dialog onClose={toggleModal} maxWidth={false} aria-labelledby="customized-dialog-title" open={modalOpened}>
          <Box display="flex" justifyContent="space-between">
            <DialogTitle className="layout horizontal space-between">
              <span>{selectedFormation.label}</span>
            </DialogTitle>
            <IconButton aria-label="Close" className={classNames(css.closeButton, "self-center")} onClick={toggleModal}>
              <Close />
            </IconButton>
          </Box>
          <DialogContent className={css.dialogContent}>
            <Table className={classNames(css.table, css.flexTable)}>
              <TableHead>
                <TableRow className={css.row}>
                  <TableCell className={css.cell}>MD</TableCell>
                  <TableCell className={css.cell}>TVD</TableCell>
                  <TableCell className={css.cell}>VS</TableCell>
                  <TableCell className={classNames(css.cell, css.medium)}>Thickness</TableCell>
                  <TableCell className={css.cell}>Fault</TableCell>
                  <TableCell className={css.cell}>{selectedFormation.label}</TableCell>
                  <TableCell className={css.cell}>Pos</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[...surveys, ...projections].map((point, index) => {
                  const formationData = filteredSelectedFormation.data[index];
                  return (
                    <TableRow
                      key={formationData.id}
                      className={classNames(css.row, {
                        [css.PARow]: point.isProjection,
                        [css.surveyRow]: point.isSurvey,
                        [css.lastSurveyRow]: point.isLastSurvey,
                        [css.bitProjRow]: point.isBitProj
                      })}
                    >
                      <TableCell className={css.cell}>{twoDecimals(formationData.md)}</TableCell>
                      <TableCell className={css.cell}>{twoDecimals(formationData.tvd)}</TableCell>
                      <TableCell className={css.cell}>{twoDecimals(formationData.vs)}</TableCell>
                      <TableCell className={classNames(css.cell, css.medium)}>
                        {twoDecimals(formationData.thickness)}
                      </TableCell>
                      <TableCell className={css.cell}>{twoDecimals(formationData.fault)}</TableCell>
                      <TableCell className={css.cell}>{twoDecimals(formationData.tot)}</TableCell>
                      <TableCell className={css.cell}>{twoDecimals(formationData.pos)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </DialogContent>
          <DialogActions>
            <Button onClick={toggleModal} variant="contained" color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </React.Fragment>
  );
}
