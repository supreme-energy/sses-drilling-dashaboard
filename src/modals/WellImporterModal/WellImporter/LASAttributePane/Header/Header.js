import upperFirst from "lodash/upperFirst";
import React from "react";
import { Button, Typography, Box } from "@material-ui/core";
import CSVHeader from "../../CSVAttributePane/Header";
import classNames from "classnames";
import css from "./styles.scss";
import { useParsedFileSelector, isValueDefined, getFieldValue } from "../../selectors";
import { useSelector } from "react-redux";
import { useWellImporterContainer } from "../../";
import values from "lodash/values";
import mapValues from "lodash/mapValues";
import pickBy from "lodash/pickBy";
import { useWellInfo, useCreateWell, defaultTransform } from "../../../../../api";
import { apiFieldMapping } from "../../models/mappings";
import CircularProgress from "@material-ui/core/CircularProgress";
import { useWellImporterSaveContainer } from "../../../WellImporterModal";

const Header = ({ className, onClickCancel }) => {
  const { data, extension } = useParsedFileSelector();
  const selectedWellId = useSelector(state => state.wellExplorer.selectedWellId);
  const [state] = useWellImporterContainer();
  const { appAttributesModel, pendingCreateWell, pendingCreateWellName } = state;
  const [, , updateWell, refreshFetchStore] = useWellInfo(selectedWellId);
  const [{ isLoading }, dispatch] = useWellImporterSaveContainer();

  const dataToSave = pickBy(
    mapValues(values(appAttributesModel).reduce((acc, next) => ({ ...acc, ...next }), {}), (value, key) => {
      const actualValue = extension === "csv" ? getFieldValue(state.csvSelection, key, data) : value.value;
      if (isValueDefined(actualValue)) {
        return actualValue;
      }

      return null;
    }),
    d => d !== null
  );
  const haveData = !!values(dataToSave).length;
  const importEnabled = pendingCreateWell || (selectedWellId && !!values(dataToSave).length);
  const { createWell } = useCreateWell();

  const importClickHandler = async () => {
    dispatch({ type: "LOADING_START" });
    let createdWellId;
    if (pendingCreateWell) {
      dataToSave.well = pendingCreateWellName;
      const res = await createWell(pendingCreateWellName);
      createdWellId = res.jobname;
    }
    const data = Object.keys(dataToSave).reduce((acc, next) => {
      let key = apiFieldMapping[next];
      let value = dataToSave[next];

      return { ...acc, [key]: value };
    }, {});

    if (data.latitude || data.longitude) {
      const [easting, northing] = defaultTransform(null).inverse([Number(data.longitude), Number(data.latitude)]);

      data.survey_easting = easting;
      data.survey_northing = northing;
    }

    if (haveData) {
      try {
        await updateWell({ wellId: createdWellId || selectedWellId, data });
        dispatch({ type: "SAVE_SUCCESS" });
        onClickCancel();
      } catch (e) {
        dispatch({ type: "SAVE_ERROR", error: "Something went wrong" });
      }
    } else {
      dispatch({ type: "SAVE_SUCCESS" });
      onClickCancel();
    }

    refreshFetchStore();
  };

  return (
    <Box display="flex" flexDirection="column" justifyContent="space-between" className={className}>
      <div>
        <Typography variant="h5" color="primary" className={css.title}>
          {selectedWellId ? "Upload Well Data" : "Import a New Well"}
        </Typography>
      </div>

      <div className={css.topButtonContainer}>
        <Button className={css.button} color="primary" onClick={onClickCancel}>
          Cancel
        </Button>
        <Button
          className={css.button}
          variant="contained"
          color="secondary"
          disabled={!importEnabled}
          onClick={importClickHandler}
        >
          <div className="layout horizontal align-center">
            {isLoading && (
              <div className={css.butonProgressContainer}>
                <CircularProgress color="inherit" size={16} />
              </div>
            )}
            <span>Import</span>
          </div>
        </Button>
      </div>

      <div className={classNames(css.bottomContainer, { [css.csv]: extension === "csv" })}>
        {extension === "las" ? (
          Object.keys(data).map(sectionName => {
            return (
              <Button
                key={sectionName}
                className={css.skipToSectionButton}
                size="small"
                variant="outlined"
                href={`#${sectionName}`}
              >
                ~{upperFirst(sectionName)}
              </Button>
            );
          })
        ) : (
          <CSVHeader fields={data.columns} />
        )}
      </div>
    </Box>
  );
};

Header.defaultProps = {
  className: css.container
};

export default Header;
