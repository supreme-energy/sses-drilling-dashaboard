import React, { useCallback, useReducer, useEffect, useState, useMemo } from "react";
import PropTypes from "prop-types";
import { Button, TextField, IconButton, Typography } from "@material-ui/core";
import Edit from "@material-ui/icons/Edit";
import Cancel from "@material-ui/icons/Cancel";
import AddCircle from "@material-ui/icons/AddCircle";
import classNames from "classnames";
import _ from "lodash";
import usePrevious from "react-use/lib/usePrevious";

import { useEmailContacts } from "../../../../../api";
import ContactPopup from "./ContactPopup";
import { stateReducer } from "./reducer";
import Title from "../../../../../components/Title";
import {
  PERSONNEL,
  EMAIL,
  NAME,
  PHONE,
  REPORTS,
  INITIAL_MAILING_LIST_STATE,
  REPORT_LIST
} from "../../../../../constants/reportServer";
import classes from "./styles.scss";

function MailingListRow({ wellId, data, isFirstRow, handleSave, deleteContact, refresh }) {
  const label = field => (isFirstRow ? field : "");
  const [reportMailingInput, setReportMailing] = useReducer(stateReducer, INITIAL_MAILING_LIST_STATE);
  const [{ isVisible, isEditing }, setPopupMode] = useReducer(stateReducer, {
    isVisible: false,
    isEditing: false
  });
  const [reports, setReport] = useReducer(stateReducer, REPORT_LIST);
  const differenceKeys = useMemo(
    () => Object.keys(reportMailingInput).filter(k => k !== "reports" && reportMailingInput[k] !== data[k]),
    [data, reportMailingInput]
  );

  const handleAllReports = e => setReport({ allReportsSelected: e.target.checked });
  const handleReportChange = e => setReport({ [e.target.value]: e.target.checked });

  const handleEdit = useCallback(() => setPopupMode({ isVisible: true, isEditing: true }), [setPopupMode]);
  const handleClose = useCallback(() => setPopupMode({ isVisible: false }), [setPopupMode]);
  const handleDelete = async () => {
    await deleteContact(wellId, reportMailingInput.id);
    refresh();
  };

  const handleInputChange = id => e => setReportMailing({ [id]: e.target.value });

  const onSave = () => {
    if (differenceKeys.length) {
      handleSave(reportMailingInput);
      setPopupMode({ isVisible: false });
    }
  };

  const onBlur = e => {
    if (differenceKeys.length) {
      e.returnValue = "Changes you made may not be saved.";
      if (!document.activeElement.id) {
        onSave(differenceKeys);
      }
    }
  };

  useEffect(() => {
    if (data && !_.isEmpty(data)) {
      setReportMailing(data);
    }
  }, [data, setReportMailing]);

  return (
    <div className={classes.listRowContainer}>
      <TextField
        label={label(PERSONNEL.label)}
        value={reportMailingInput[PERSONNEL.field]}
        onChange={handleInputChange(PERSONNEL.field)}
        margin="normal"
        onBlur={onBlur}
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label={label(NAME.label)}
        value={reportMailingInput[NAME.field]}
        onChange={handleInputChange(NAME.field)}
        margin="normal"
        onBlur={onBlur}
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label={label(EMAIL.label)}
        value={reportMailingInput[EMAIL.field]}
        onChange={handleInputChange(EMAIL.field)}
        margin="normal"
        onBlur={onBlur}
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label={label(PHONE.label)}
        value={reportMailingInput[PHONE.field]}
        onChange={handleInputChange(PHONE.field)}
        margin="normal"
        onBlur={onBlur}
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label={label(REPORTS.label)}
        value={reportMailingInput[REPORTS.field]}
        margin="normal"
        InputLabelProps={{ shrink: true }}
        disabled
      />
      <div className={classNames(isFirstRow ? classes.controlsFirstRow : classes.controls)}>
        {isFirstRow && <Typography variant="caption">Edit</Typography>}
        <IconButton className={classes.editIcon} size="small" onClick={handleEdit} aria-label="edit">
          <Edit />
        </IconButton>
      </div>
      <div className={classNames(isFirstRow ? classes.controlsFirstRow : classes.controls)}>
        {isFirstRow && <Typography variant="caption">Delete</Typography>}
        <IconButton size="small" onClick={handleDelete} aria-label="delete">
          <Cancel />
        </IconButton>
      </div>
      <ContactPopup
        handleInputChange={handleInputChange}
        isVisible={isVisible}
        values={reportMailingInput}
        handleClose={handleClose}
        isEditing={isEditing}
        handleSave={onSave}
        reports={reports}
        handleAllReports={handleAllReports}
        handleReportChange={handleReportChange}
      />
    </div>
  );
}

function ReportMailingList({ wellId }) {
  const { data, updateEmailContact, addEmailContact, deleteEmailContact, refresh } = useEmailContacts(wellId);
  const [reports, setReport] = useReducer(stateReducer, REPORT_LIST);

  const [isVisible, setPopupVisibility] = useState(false);
  const [addContactInput, setAddContact] = useReducer(stateReducer, INITIAL_MAILING_LIST_STATE);
  const wasVisible = usePrevious(isVisible);

  const handleClickAdd = useCallback(() => setPopupVisibility(true), []);
  const handleClose = useCallback(() => setPopupVisibility(false), []);
  const handleAllReports = e => setReport({ allReportsSelected: e.target.checked });
  const handleReportChange = e => setReport({ [e.target.value]: e.target.checked });
  const handleInputChange = id => e => setAddContact({ [id]: e.target.value });
  const handleUpdateContact = useCallback(body => updateEmailContact(wellId, body), [wellId, updateEmailContact]);

  const handleAddContact = async () => {
    await addEmailContact(wellId, addContactInput);
    refresh();
    handleClose();
  };

  useEffect(() => {
    if (wasVisible && !isVisible) {
      setAddContact(INITIAL_MAILING_LIST_STATE);
    }
  }, [wasVisible, isVisible]);

  return (
    <div className={classes.reportMailingListContainer}>
      <Title>Report Mailing List</Title>
      <form>
        {data.map((dataObj, index) => {
          const isFirstRow = index === 0;
          return (
            <MailingListRow
              key={index}
              wellId={wellId}
              data={dataObj}
              isFirstRow={isFirstRow}
              deleteContact={deleteEmailContact}
              handleSave={handleUpdateContact}
              refresh={refresh}
            />
          );
        })}
      </form>
      <Button color="secondary" className={classes.addContactButton} onClick={handleClickAdd} aria-label="edit">
        <AddCircle />
        Add Contact
      </Button>
      <ContactPopup
        handleInputChange={handleInputChange}
        isVisible={isVisible}
        values={addContactInput}
        handleClose={handleClose}
        handleSave={handleAddContact}
        reports={reports}
        handleAllReports={handleAllReports}
        handleReportChange={handleReportChange}
      />
    </div>
  );
}

ReportMailingList.propTypes = {
  wellId: PropTypes.string
};

export default ReportMailingList;
