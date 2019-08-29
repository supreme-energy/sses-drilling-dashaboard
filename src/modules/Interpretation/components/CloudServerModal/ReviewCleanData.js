import React, { useState, useMemo, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Button,
  IconButton,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
  DialogContentText,
  Select,
  InputLabel,
  MenuItem,
  FormControl
} from "@material-ui/core";
import Close from "@material-ui/icons/Close";
import _ from "lodash";
import { IMPORT } from "../../../../constants/interpretation";
import classes from "./styles.scss";
import { useCloudImportSurveys } from "../../../../api";

const ReviewCleanData = React.memo(({ wellId, handleClose, setView }) => {
  const { data } = useCloudImportSurveys(wellId, 1);
  const [currentId, setCurrentId] = useState(0);
  const currentSurvey = useMemo(() => _.filter(data, value => value.id === currentId), [currentId, data]);
  const headers = useMemo(() => Object.keys(_.get(data, "[0].data.cleaned_surveys[0]", [])), [data]);
  const disableImport = _.get(data, "[0].id") !== currentId;
  const handleImportWithDip = () => {
    setView(IMPORT);
  };
  const handleImportWithoutDip = () => {
    setView(IMPORT);
  };
  function handleSelectDataSet(event) {
    setCurrentId(event.target.value);
  }

  useEffect(() => {
    if (data && data.length) setCurrentId(data[0].id);
  }, [data]);

  return (
    <React.Fragment>
      <DialogTitle className={classes.notificationDialogTitle}>
        <span>Deleted Surveys</span>
        <IconButton aria-label="Close" className={classes.closeButton} onClick={handleClose}>
          <Close />
        </IconButton>
        <DialogContentText>
          The following surveys were removed from the model. Re-import cleaned surveys below or cancel and return to the
          Well Log update screen to import each survey.
        </DialogContentText>
      </DialogTitle>
      <DialogContent className={classes.notificationContent}>
        <FormControl>
          <InputLabel htmlFor="age-simple">Clean-Up Timestamp</InputLabel>

          <Select value={currentId} onChange={handleSelectDataSet} inputProps={{ name: "survey" }}>
            {data.map(dataSet => (
              <MenuItem key={dataSet.id} value={dataSet.id}>
                {dataSet.created}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              {headers.map(field => {
                return (
                  <TableCell key={`${field} header`} className={classes.cell} component="th" scope="row">
                    {field}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {currentSurvey.length > 0 &&
              currentSurvey[0].data.cleaned_surveys.map((survey, index) => (
                <TableRow key={index}>
                  {_.map(survey, (value, key) => (
                    <TableCell key={key + index} className={classes.cell} component="th" scope="row">
                      {value}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </DialogContent>
      <DialogActions className={classes.autoImportReviewActions}>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleImportWithDip} color="primary" disabled={disableImport}>
          Import Without Dip and Fault
        </Button>
        <Button onClick={handleImportWithoutDip} variant="contained" color="primary" disabled={disableImport}>
          Import With Dip and Fault
        </Button>
      </DialogActions>
    </React.Fragment>
  );
});

ReviewCleanData.propTypes = {
  wellId: PropTypes.string,
  handleClose: PropTypes.func,
  setView: PropTypes.func
};

export default ReviewCleanData;
