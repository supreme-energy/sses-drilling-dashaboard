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

const Header = ({ className, onClickCancel }) => {
  const { data, extension } = useParsedFileSelector();
  const selectedWellId = useSelector(state => state.wellExplorer.selectedWellId);
  const [state] = useWellImporterContainer();
  const { appAttributesModel } = state;

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
        <Button className={css.button} variant="contained" color="secondary" disabled>
          Import
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
