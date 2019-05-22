import React from "react";
import PropTypes from "prop-types";
import get from "lodash/get";
import isEmpty from "lodash/isEmpty";

import AppAttributePaneBody from "../AppAttributePane/Body";
import LASAttributePaneBody from "../LASAttributePane/Body";

import css from "./styles.scss";

const Body = ({
  data,
  onClickCell,
  appAttributesModel,
  appAttributesFieldMapping,
  activateInput,
  className,
  highlightedRowAndColumnList,
  textHighlightedRowAndColumnList,
  activeInput
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
              const type = get(appAttributesFieldMapping, [sectionKey, fieldKey, "type"], "cell");
              activateInput({ sectionKey, fieldKey, type });
            }
          }}
        />
      </div>
      <div className={css.lasAttributePaneBodyContainer}>
        <LASAttributePaneBody
          data={data}
          highlightedRowAndColumnList={highlightedRowAndColumnList}
          textHighlightedRowAndColumnList={textHighlightedRowAndColumnList}
          onClickCell={onClickCell}
          unlocked={!isEmpty(activeInput)}
        />
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
  data: PropTypes.object.isRequired,
  onClickCell: PropTypes.func.isRequired,
  appAttributesModel: PropTypes.object.isRequired,
  appAttributesFieldMapping: PropTypes.object.isRequired,
  activateInput: PropTypes.func.isRequired,
  className: PropTypes.string,
  highlightedRowAndColumnList: PropTypes.object,
  textHighlightedRowAndColumnList: PropTypes.object,
  activeInput: PropTypes.string
};

export default Body;
