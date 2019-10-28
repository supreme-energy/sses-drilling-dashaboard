import React from "react";
import PropTypes from "prop-types";
import {
  Box,
  Button,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from "@material-ui/core";

import Close from "@material-ui/icons/Close";
import css from "./Details.scss";
import comboClasses from "../ComboDashboard.scss";
import DetailsTable from ".";
import WellInfoField from "./WellInfoField";
import { limitAzm } from "../CrossSection/formulas";
import { useSurveysDataContainer, useWellPlanDataContainer, useFormationsDataContainer } from "../../../App/Containers";
import classNames from "classnames";
import { twoDecimalsNoComma } from "../../../../constants/format";
import OpenInBrowser from "@material-ui/icons/OpenInBrowser";
import WellPlanImporterModal from "../../../../modals/WellPlanImporterModal";
import { NumericDebouceTextField } from "../../../../components/DebouncedInputs";
import { AutoSizer, List } from "react-virtualized";

export const WELL_PLAN = "Well Plan";
export const WELL_SURVEYS = "Well Surveys";

const noRowsRenderer = () => <div>No well plan data</div>;

function WellPlanTable() {
  const [data, , , , , { updatePlanItem }] = useWellPlanDataContainer();

  const rowRenderer = ({ index, isScrolling, key, style }) => {
    const d = data[index];
    const update = field => value => updatePlanItem({ id: d.id, [field]: value });
    return (
      <TableRow key={key} style={style}>
        <TableCell className={css.cell}>{index === 0 ? "Tie-in" : d.num}</TableCell>
        <TableCell className={css.cell}>{twoDecimalsNoComma(d.md)}</TableCell>
        <TableCell className={css.cell}>{twoDecimalsNoComma(d.inc)}</TableCell>
        <TableCell className={css.cell}>{twoDecimalsNoComma(d.azm)}</TableCell>
        <TableCell className={css.cell}>
          <NumericDebouceTextField
            debounceInterval={500}
            value={d.tvd}
            error={index === 0 && d.tvd === 0}
            onChange={update("tvd")}
          />
        </TableCell>
        <TableCell className={css.cell}>
          <NumericDebouceTextField
            debounceInterval={500}
            error={index === 0 && d.vs === 0}
            value={d.vs}
            onChange={update("vs")}
          />
        </TableCell>
        <TableCell className={css.cell}>
          <NumericDebouceTextField
            debounceInterval={500}
            error={index === 0 && d.ns === 0}
            value={d.ns}
            onChange={update("ns")}
          />
        </TableCell>
        <TableCell className={css.cell}>
          <NumericDebouceTextField
            debounceInterval={500}
            error={index === 0 && d.ew === 0}
            value={d.ew}
            onChange={update("ew")}
          />
        </TableCell>
        <TableCell className={css.cell}>{twoDecimalsNoComma(d.cd)}</TableCell>
        <TableCell className={css.cell}>{twoDecimalsNoComma(d.ca)}</TableCell>
        <TableCell className={css.cell}>{twoDecimalsNoComma(d.dl)}</TableCell>
        <TableCell className={css.cell}>{twoDecimalsNoComma(d["dip-c"])}</TableCell>
      </TableRow>
    );
  };

  return (
    <Table className={classNames(css.table, css.flexTable, css.noBorder, css.wellPlanTable)}>
      <TableHead>
        <TableRow className={css.row}>
          <TableCell className={css.cell}>Survey</TableCell>
          <TableCell className={css.cell}>MD</TableCell>
          <TableCell className={css.cell}>Inc</TableCell>
          <TableCell className={css.cell}>Az</TableCell>
          <TableCell className={css.cell}>TVD</TableCell>
          <TableCell className={css.cell}>Vertical Section</TableCell>
          <TableCell className={css.cell}>NS</TableCell>
          <TableCell className={css.cell}>EW</TableCell>
          <TableCell className={css.cell}>CD</TableCell>
          <TableCell className={css.cell}>CA</TableCell>
          <TableCell className={css.cell}>DL</TableCell>
          <TableCell className={css.cell}>Dip-C</TableCell>
        </TableRow>
      </TableHead>
      <TableBody className={css.wellPlanBody}>
        <AutoSizer>
          {({ width, height }) => (
            <List
              ref="List"
              height={height}
              overscanRowCount={10}
              noRowsRenderer={noRowsRenderer}
              rowCount={data.length}
              rowHeight={60}
              rowRenderer={rowRenderer}
              width={width}
            />
          )}
        </AutoSizer>
      </TableBody>
    </Table>
  );
}

function DetailsFullModal({
  handleClose,
  isVisible,
  activeTab,
  changeActiveTab,
  showImportWellPlanModal,
  toggleImportWellPlanModal
}) {
  const { updateTieInTCL } = useSurveysDataContainer();
  const { refreshFormations } = useFormationsDataContainer();

  return (
    <Dialog
      onClose={handleClose}
      className={css.dialog}
      maxWidth={false}
      aria-labelledby="customized-dialog-title"
      open={isVisible}
    >
      <DialogTitle className={css.dialogTitle}>
        <Box display="flex" flexDirection="column" boxShadow="1">
          <Box display="flex" flexDirection="row" justifyContent="space-between" className={css.titleRow}>
            <span>Survey Data</span>
            <IconButton aria-label="Close" className={css.closeButton} onClick={handleClose}>
              <Close />
            </IconButton>
          </Box>
          <Tabs
            value={activeTab}
            indicatorColor="primary"
            onChange={(_, tab) => changeActiveTab(tab)}
            className={css.tabs}
          >
            <Tab label={WELL_PLAN} value={WELL_PLAN} />
            <Tab label={WELL_SURVEYS} value={WELL_SURVEYS} />
          </Tabs>
          {activeTab === WELL_PLAN && (
            <Button onClick={toggleImportWellPlanModal} className={classNames("self-start", css.importButton)}>
              <OpenInBrowser />
              Import Well Plan
            </Button>
          )}
        </Box>
      </DialogTitle>
      <DialogContent className={css.dialogContent}>
        {activeTab === WELL_SURVEYS ? (
          <Box display="flex" flexDirection="column">
            <Box display="flex" flexDirection="row">
              <Box display="flex" flexDirection="column">
                <div className={comboClasses.flexRight}>
                  <WellInfoField label={"Proposed Direction"} field="propazm" options={{ mask: limitAzm }} />
                  <WellInfoField label={"Projected Dip"} field="projdip" />
                  <WellInfoField
                    label={"TCL"}
                    field="tot"
                    onAfterUpdate={refreshFormations}
                    inputProps={{ min: "0" }}
                    options={{
                      debounceAction: updateTieInTCL
                    }}
                  />
                  <WellInfoField label={"Auto Pos-TCL"} field="autoposdec" inputProps={{ min: "0" }} />
                </div>
                <DetailsTable showFullTable />
              </Box>
            </Box>
          </Box>
        ) : (
          <WellPlanTable />
        )}
        <WellPlanImporterModal handleClose={toggleImportWellPlanModal} isVisible={showImportWellPlanModal} />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant="contained" color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

DetailsFullModal.propTypes = {
  handleClose: PropTypes.func,
  isVisible: PropTypes.bool,
  activeTab: PropTypes.bool,
  changeActiveTab: PropTypes.func,
  showImportWellPlanModal: PropTypes.bool,
  toggleImportWellPlanModal: PropTypes.func
};

export default DetailsFullModal;
