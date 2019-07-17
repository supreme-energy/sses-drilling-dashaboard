import React, { useCallback, useReducer, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { TextField, IconButton, Typography } from "@material-ui/core";
import Edit from "@material-ui/icons/Edit";
import Cancel from "@material-ui/icons/Cancel";
import classNames from "classnames";

import ContactPopup from "./ContactPopup";
import { mailingListReducer } from "./reducer";
import Title from "../../../../../components/Title";
import classes from "./styles.scss";

function MailingListRow({ data, onChange, isFirstRow }) {
  const label = field => (isFirstRow ? field : "");
  const [popupVisible, setPopupVisibility] = useState(false);
  const [reportMailingInput, setReportMailing] = useReducer(mailingListReducer, {});

  useEffect(() => {
    setReportMailing({ type: "UPDATE", payload: data });
  }, [data]);

  const handleInputChange = useCallback(
    e => setReportMailing({ type: "UPDATE", payload: { [e.target.id]: e.target.value } }),
    []
  );
  const onBlur = useCallback(() => {
    if (!document.activeElement.id) {
      const differenceKey = Object.keys(reportMailingInput).filter(k => reportMailingInput[k] !== data[k]);
      onChange(differenceKey, reportMailingInput[differenceKey]);
    }
  }, [onChange, reportMailingInput, data]);

  const handleClickEdit = () => setPopupVisibility(true);
  const handleClosePopup = () => setPopupVisibility(false);

  return (
    <div className={classes.listRowContainer}>
      <TextField
        id="personnel"
        label={label("Personnel")}
        value={reportMailingInput.personnel}
        onChange={handleInputChange}
        margin="normal"
        onBlur={onBlur}
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        id="name"
        label={label("Name")}
        value={reportMailingInput.name}
        onChange={handleInputChange}
        margin="normal"
        onBlur={onBlur}
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        id="email_address"
        label={label("Email Address")}
        value={reportMailingInput.email_address}
        onChange={handleInputChange}
        margin="normal"
        onBlur={onBlur}
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        id="phone"
        label={label("Phone")}
        value={reportMailingInput.phone}
        onChange={handleInputChange}
        margin="normal"
        onBlur={onBlur}
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        id="reports"
        label={label("Reports")}
        value={reportMailingInput.reports}
        onChange={handleInputChange}
        margin="normal"
        onBlur={onBlur}
        InputLabelProps={{ shrink: true }}
      />
      <div className={classNames(isFirstRow ? classes.controlsFirstRow : classes.controls)}>
        {isFirstRow && <Typography variant="caption">Edit</Typography>}
        <IconButton className={classes.editIcon} size="small" onClick={handleClickEdit} aria-label="edit">
          <Edit />
        </IconButton>
      </div>
      <div className={classNames(isFirstRow ? classes.controlsFirstRow : classes.controls)}>
        {isFirstRow && <Typography variant="caption">Delete</Typography>}
        <IconButton size="small" onClick={() => setReportMailing({ type: "DELETE" })} aria-label="delete">
          <Cancel />
        </IconButton>
      </div>
      <ContactPopup
        handleInputChange={handleInputChange}
        isVisible={popupVisible}
        values={reportMailingInput}
        handleClose={handleClosePopup}
        isEditing
      />
    </div>
  );
}

function ReportMailingList({ mailListData, onChange }) {
  return (
    <div className={classes.reportMailingListContainer}>
      <Title>Report Mailing List</Title>
      <form>
        {mailListData.map((dataObj, index) => {
          const isFirstRow = index === 0;
          return <MailingListRow key={index} data={dataObj} onChange={onChange} isFirstRow={isFirstRow} />;
        })}
      </form>
    </div>
  );
}

ReportMailingList.propTypes = {
  mailListData: PropTypes.arrayOf(PropTypes.object),
  onChange: PropTypes.func
};

export default ReportMailingList;
