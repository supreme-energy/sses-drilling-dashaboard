import React from "react";
import PropTypes from "prop-types";

import AppAttributePaneBody from "../AppAttributePane/Body";
import LASAttributePaneBody from "../LASAttributePane/Body";

import css from "./styles.scss";

const Body = ({
                data,
                className,
                highlightedRowAndColumnList,
                textHighlightedRowAndColumnList,
                setHighlightedRowAndColumnList,
                setTextHighlightedRowAndColumnList,
                onClickCell,
                appAttributesModel,
                appAttributesFieldMapping,
                activeInput,
                activateInput,
                combineHighlightedAndTextHighlightedMaps,
                inputToCellId
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
              activateInput({sectionKey, fieldKey});
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
          unlocked={activeInput}
        />
      </div>
    </div>
  );
};

Body.defaultProps = {
  className: css.container,
  highlightedRowAndColumnList: [],
};

Body.propTypes = {
  data: PropTypes.object.isRequired,
  onClickCell: PropTypes.func.isRequired,
  appAttributesModel: PropTypes.object.isRequired,
  appAttributesFieldMapping: PropTypes.object.isRequired,
  setActiveInput: PropTypes.func.isRequired,
  combineHighlightedAndTextHighlightedMaps: PropTypes.func.isRequired,
  className: PropTypes.string,
  highlightedRowAndColumnList: PropTypes.object,
  textHighlightedRowAndColumnList: PropTypes.object,
  activeInput: PropTypes.string,
};

export default Body;
