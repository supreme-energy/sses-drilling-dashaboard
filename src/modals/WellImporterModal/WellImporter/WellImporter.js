import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import cloneDeep from "lodash/cloneDeep";

import Body from "./Body";
import Header from "./Header";
import LAS2Parser from "../../../parsers/las/LAS2Parser";

import css from "./styles.scss";

const wellInfoFieldMapping = {
  well: {
    labelName: "Well",
    required: [ "Well Info" ],
    predictedFieldName: "", // field name to be used when importing new well, we guess that it is associated with this
                            // field
    index: 0,
  },
  operator: {
    labelName: "Operator",
    required: [ "Well Info" ],
    index: 1,
  },
  rigId: {
    labelName: "Rig Id",
    index: 2,
  },
  jobNumber: {
    labelName: "Job Number",
    index: 3,
  },
  api: {
    labelName: "API or UWI",
    required: [ "Well Info" ],
    index: 4,
  },
  field: {
    labelName: "Field",
    required: [ "Well Info" ],
    index: 5,
  },
  location: {
    labelName: "Location",
    required: [ "Well Info" ],
    index: 6,
  },
  state: {
    labelName: "State or Province",
    required: [ "Well Info" ],
    index: 7,
  },
  county: {
    labelName: "County",
    required: [ "Well Info" ],
    index: 8,
  },
  country: {
    labelName: "Country",
    required: [ "Well Info" ],
    index: 9,
  },
};

const sectionMapping = {
  wellInfo: {
    labelName: "Well Info",
  },
  wellParameters: {
    labelName: "Well Parameters",
  },
  wellData: {
    labelName: "Well Data",
  },
};

const wellParametersFieldMapping = {
  longitude: {
    labelName: "Longitude",
    required: [ "Well Data" ],
    index: 0,
  },
  latitude: {
    labelName: "Latitude",
    required: [ "Well Data" ],
    index: 1,
  },
};

const defaultFieldModel = { value: "" };

// TODO: we will need to account for Canada.
const defaultWellInfoModel = {
  well: cloneDeep(defaultFieldModel),
  operator: cloneDeep(defaultFieldModel),
  rigId: cloneDeep(defaultFieldModel),
  jobNumber: cloneDeep(defaultFieldModel),
  api: cloneDeep(defaultFieldModel), // This well id can either be API for the US or UWI for locations in Canada.
  field: cloneDeep(defaultFieldModel),
  location: cloneDeep(defaultFieldModel),
  state: cloneDeep(defaultFieldModel), // Province is used for canada (this is obvious but wanted to keep track)
  county: cloneDeep(defaultFieldModel),
  country: cloneDeep(defaultFieldModel),
};

const defaultWellParametersModel = {
  latitude: cloneDeep(defaultFieldModel),
  longitude: cloneDeep(defaultFieldModel),
};

const defaultWellDataModel = {};

const defaultAppAttributesModel = {
  wellInfo: defaultWellInfoModel,
  wellParameters: defaultWellParametersModel,
  wellData: defaultWellDataModel,
};

const appAttributesFieldMapping = {
  wellInfo: wellInfoFieldMapping,
  wellParameters: wellParametersFieldMapping,
  wellData: {},
};

const WellImporter = ({ files, onClickCancel }) => {
  const [ isLoaded, setIsLoaded ] = useState(false);
  const [ data, setData ] = useState(null);
  const [ appAttributesModel, setAppAttributesModel ] = useState(defaultAppAttributesModel);
  const [ activeInput, setActiveInput ] = useState(null);
  const [ inputToCellId, setInputToCellId ] = useState({});
  const [ highlightedRowAndColumnList, setHighlightedRowAndColumnList ] = useState(null);
  const [ textHighlightedRowAndColumnList, setTextHighlightedRowAndColumnList ] = useState(null);

  const onClickCell = (sectionName, key, cellData, rowIndex, columnIndex) => {
    const cellAlreadySelected = Object.keys(inputToCellId).find((inputId) => {
      return inputToCellId[ inputId ] === `${sectionName}-${key}-${cellData}`;
    });

    if (activeInput) {
      const currentState = cloneDeep(appAttributesModel);
      const updatedState = {
        ...currentState,
        [ activeInput.sectionKey ]: {
          ...currentState[ activeInput.sectionKey ],
          [ activeInput.fieldKey ]: {
            ...currentState[ activeInput.sectionKey ][ activeInput.fieldKey ],
            value: !cellAlreadySelected ? cellData : "",
            cellId: !cellAlreadySelected ? `${sectionName}-${key}-${cellData}` : "",
          },
        },
      };

      const inputId = `${activeInput.sectionKey}-${activeInput.fieldKey}`;
      const cellId = `${sectionName}-${key}-${cellData}`;
      setAppAttributesModel(updatedState);
      if (!cellAlreadySelected) {
        setHighlightedRowAndColumnListHelper(sectionName, key, cellData);
        setInputToCellId({
          ...inputToCellId,
          [ inputId ]: cellId,
        });
      }
      else {
        if (inputToCellId[ cellAlreadySelected ] === cellId && inputId === cellAlreadySelected) {
          setHighlightedRowAndColumnList({});
          const updatedTextHighlightedRowAndColumnList = { ...textHighlightedRowAndColumnList };
          delete updatedTextHighlightedRowAndColumnList[ cellId ];
          setTextHighlightedRowAndColumnList(updatedTextHighlightedRowAndColumnList);
          const updatedInputToCellId = { ...inputToCellId };
          delete updatedInputToCellId[ inputId ];
          setInputToCellId(updatedInputToCellId);
        }
      }

    }
  };

  const setHighlightedRowAndColumnListHelper = (sectionName, key, cellData) => {
    const cellId = `${sectionName}-${key}-${cellData}`;
    setHighlightedRowAndColumnList({
      [ cellId ]: true,
    });
  };

  useEffect(() => {
    if (!isLoaded && files.length) {
      const parsedData = LAS2Parser.parse(files[ 0 ].fileText);
      setData(parsedData);
      setIsLoaded(true);
    }
  }, [ isLoaded, files ]);

  const activateInput = (newActiveInput) => {
    if (activeInput && newActiveInput && activeInput.sectionKey === newActiveInput.sectionKey && activeInput.fieldKey === newActiveInput.fieldKey) {
      setActiveInput(null);
      return;
    }

    let newActiveInputCellValue;
    if (newActiveInput) {
      newActiveInputCellValue = inputToCellId[ `${newActiveInput.sectionKey}-${newActiveInput.fieldKey}` ];
      // Need to add it to the highlighted cells
      if (newActiveInputCellValue) {
        setHighlightedRowAndColumnList({ [ newActiveInputCellValue ]: true });
      }
      else {
        setHighlightedRowAndColumnList({});
      }
    }

    const updatedTextHighlightedRowAndColumnList = Object.values(inputToCellId).reduce((map, cellId) => {
      if (cellId === newActiveInputCellValue) {
        return map;
      }

      return { ...map, [ cellId ]: true };
    }, {});

    setTextHighlightedRowAndColumnList(updatedTextHighlightedRowAndColumnList);
    setActiveInput(newActiveInput);
  };

  if (!files || !files.length || !data) {
    return null;
  }

  return (
    <div className={css.container}>
      <Header
        data={data}
        onClickCancel={onClickCancel}
        appAttributesFieldMapping={appAttributesFieldMapping}
        appAttributesModel={appAttributesModel}
        sectionMapping={sectionMapping}
      />
      <Body
        data={data}
        onClickCell={onClickCell}
        appAttributesModel={appAttributesModel}
        appAttributesFieldMapping={appAttributesFieldMapping}
        highlightedRowAndColumnList={highlightedRowAndColumnList}
        setHighlightedRowAndColumnList={setHighlightedRowAndColumnList}
        textHighlightedRowAndColumnList={textHighlightedRowAndColumnList}
        setTextHighlightedRowAndColumnList={setTextHighlightedRowAndColumnList}
        activeInput={activeInput}
        setActiveInput={setActiveInput}
        inputToCellId={inputToCellId}
        activateInput={activateInput}
      />
    </div>
  );
};

WellImporter.defaultProps = {
  onClickCell: () => {
  },
};

WellImporter.propTypes = {
  onClickCancel: PropTypes.func.isRequired,
  files: PropTypes.array,
};

export default WellImporter;
