import React from "react";
import PropTypes from "prop-types";
import get from "lodash/get";
import isEmpty from "lodash/isEmpty";
import { INPUT_TYPES } from "../constants";

import AppAttributePaneBody from "../AppAttributePane/Body";
import LASAttributePaneBody from "../LASAttributePane/Body";
import CSVAttributePane from "../CSVAttributePane";

import css from "./styles.scss";

const Body = ({
  onClickCell,
  onClickAsciiHeader,
  appAttributesModel,
  appAttributesFieldMapping,
  activateInput,
  className,
  highlightedRowAndColumnList,
  textHighlightedRowAndColumnList,
  activeInput,
  extension
}) => {
  return (
    <div className={className}>
      <div className={css.appAttributePaneBodyContainer}>
        <AppAttributePaneBody
          activeInput={activeInput}
          appAttributesModel={appAttributesModel}
          appAttributesFieldMapping={appAttributesFieldMapping}
          onFocus={(event, appAttributeConfig, appAttributeModel, fieldKey, sectionKey) => {
            if (activeInput && activeInput.sectionKey === sectionKey && activeInput.fieldKey === fieldKey) {
              activateInput(null);
            } else {
              const type = get(appAttributesFieldMapping, [sectionKey, fieldKey, "type"], INPUT_TYPES.CELL);
              activateInput({ sectionKey, fieldKey, type });
            }
          }}
        />
      </div>
      <div className={css.lasAttributePaneBodyContainer}>
        {extension === "las" ? (
          <LASAttributePaneBody
            highlightedRowAndColumnList={highlightedRowAndColumnList}
            textHighlightedRowAndColumnList={textHighlightedRowAndColumnList}
            onClickCell={onClickCell}
            onClickAsciiHeader={onClickAsciiHeader}
            unlocked={!isEmpty(activeInput)}
          />
        ) : (
          <CSVAttributePane />
        )}
      </div>
    </div>
  );
};

Body.defaultProps = {
  className: css.container,
  highlightedRowAndColumnList: {},
  textHighlightedRowAndColumnList: {}
};

Body.propTypes = {
  onClickCell: PropTypes.func.isRequired,
  onClickAsciiHeader: PropTypes.func.isRequired,
  appAttributesModel: PropTypes.object.isRequired,
  appAttributesFieldMapping: PropTypes.object.isRequired,
  activateInput: PropTypes.func.isRequired,
  className: PropTypes.string,
  highlightedRowAndColumnList: PropTypes.object,
  textHighlightedRowAndColumnList: PropTypes.object,
  activeInput: PropTypes.object,
  extension: PropTypes.string
};

export default Body;
