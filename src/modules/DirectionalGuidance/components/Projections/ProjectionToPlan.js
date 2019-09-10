import React, { useReducer, useState, useCallback } from "react";
import { Button, TextField, MenuItem, Select, IconButton } from "@material-ui/core";
import ChevronLeft from "@material-ui/icons/ChevronLeft";
import ChevronRight from "@material-ui/icons/ChevronRight";
import { projectionPages } from "../../../../constants/directionalGuidance";
import { fieldReducer, pageReducer } from "./reducers";
import classes from "./styles.scss";

function ProjectionToPlan() {
  const [selectValue, setSelect] = useState("TOP");

  const handleSelect = useCallback(({ target: { value } }) => setSelect(value), []);
  const [pageValues, setFieldValue] = useReducer(fieldReducer, projectionPages);
  const [pageSelected, setSelectedPage] = useReducer(pageReducer, 0);

  const handleFieldValueChange = (fieldName, page) => setFieldValue({ type: "SET", payload: { fieldName, page } });
  const handlePageSelect = type => setSelectedPage({ type, payload: projectionPages.length });

  return (
    <div className={classes.projectionToPlanContainer}>
      <div className={classes.projectionContainerBody}>
        {pageSelected > 0 && (
          <IconButton color="primary" onClick={() => handlePageSelect("DECREMENT")}>
            <ChevronLeft />
          </IconButton>
        )}
        {pageValues[pageSelected].columns.map((column, index) => (
          <div className={classes.kpiColumn} key={index}>
            {column.map(({ label, value }) => (
              <TextField
                key={label}
                label={label}
                className={classes.textField}
                value={value}
                onChange={() => handleFieldValueChange(label, pageSelected)}
                margin="normal"
              />
            ))}
          </div>
        ))}
        {pageSelected < projectionPages.length - 1 && (
          <IconButton color="primary" onClick={() => handlePageSelect("INCREMENT")}>
            <ChevronRight />
          </IconButton>
        )}
      </div>
      <div className={classes.projectionsControls}>
        <Select
          value={selectValue}
          onChange={handleSelect}
          inputProps={{
            name: "age",
            id: "age-simple"
          }}
        >
          <MenuItem value={"TOP"}>Top</MenuItem>
          <MenuItem value={"CENTER"}>Centerline</MenuItem>
          <MenuItem value={"BASE"}>Base</MenuItem>
        </Select>
        <Button variant="contained" color="primary">
          Calculate
        </Button>
      </div>
    </div>
  );
}

export default ProjectionToPlan;
