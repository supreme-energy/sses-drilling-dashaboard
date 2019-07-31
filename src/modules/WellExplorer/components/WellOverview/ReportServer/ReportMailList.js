import React, { useCallback, useReducer, useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import { Button, TextField, IconButton, Typography } from "@material-ui/core";
import Edit from "@material-ui/icons/Edit";
import Cancel from "@material-ui/icons/Cancel";
import AddCircle from "@material-ui/icons/AddCircle";
import classNames from "classnames";
import _ from "lodash";

import ContactPopup from "./ContactPopup";
import { mailingListReducer, stateReducer } from "./reducer";
import Title from "../../../../../components/Title";
import {
  PERSONNEL,
  EMAIL,
  NAME,
  PHONE,
  REPORTS,
  INITIAL_MAILING_LIST_STATE
} from "../../../../../constants/reportServer";
import classes from "./styles.scss";

function MailingListRow({ data, onChange, isFirstRow }) {
  const label = field => (isFirstRow ? field : "");
  const [reportMailingInput, setReportMailing] = useReducer(mailingListReducer, INITIAL_MAILING_LIST_STATE);
  const [{ isVisible, isEditing }, setPopupMode] = useReducer(stateReducer, {
    isVisible: false,
    isEditing: false
  });
  const dataInitialized = useRef(false);

  const handleEdit = useCallback(() => setPopupMode({ isVisible: true, isEditing: true }), [setPopupMode]);
  const handleClose = useCallback(() => setPopupMode({ isVisible: false }), [setPopupMode]);
  const handleDelete = useCallback(() => setReportMailing({ type: "DELETE" }), []);

  const handleInputChange = id => e => setReportMailing({ type: "UPDATE", payload: { [id]: e.target.value } });

  const onBlur = useCallback(
    e => {
      e.returnValue = "Changes you made may not be saved.";
      if (!document.activeElement.id) {
        const differenceKey = Object.keys(reportMailingInput).filter(k => reportMailingInput[k] !== data[k]);
        if (differenceKey.length) {
          onChange(differenceKey, reportMailingInput[differenceKey]);
        }
      }
    },
    [onChange, reportMailingInput, data]
  );

  useEffect(() => {
    if (data && !_.isEmpty(data) && !dataInitialized.current) {
      setReportMailing({ type: "UPDATE", payload: data });
      dataInitialized.current = true;
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
      />
    </div>
  );
}

function ReportMailingList({ mailListData, onChange }) {
  const [isVisible, setPopupVisibility] = useState(false);
  const [addContactInput, setAddContact] = useReducer(mailingListReducer, INITIAL_MAILING_LIST_STATE);

  const handleClickAdd = useCallback(() => setPopupVisibility(true), []);
  const handleClose = useCallback(() => setPopupVisibility(false), []);
  const handleInputChange = id => e => setAddContact({ type: "UPDATE", payload: { [id]: e.target.value } });

  return (
    <div className={classes.reportMailingListContainer}>
      <Title>Report Mailing List</Title>
      <form>
        {mailListData.map((dataObj, index) => {
          const isFirstRow = index === 0;
          return <MailingListRow key={index} data={dataObj} onChange={onChange} isFirstRow={isFirstRow} />;
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
      />
    </div>
  );
}

ReportMailingList.propTypes = {
  mailListData: PropTypes.arrayOf(PropTypes.object),
  onChange: PropTypes.func
};

export default ReportMailingList;
