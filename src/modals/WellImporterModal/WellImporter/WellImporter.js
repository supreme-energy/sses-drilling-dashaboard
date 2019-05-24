import React, { useEffect, useState, useReducer } from "react";
import PropTypes from "prop-types";
import cloneDeep from "lodash/cloneDeep";
import intersection from "lodash/intersection";

import {
  setActiveInput,
  addInputToCellIds,
  removeInputToCellIds,
  updateAttributesModel,
  clearHighlightedCellIds,
  addHighlightedCellIds,
  removeHighlightedTextCellIds,
  addHighlightedTextCellIds
} from "./state/actions";
import reducer from "./state/reducer";
import Body from "./Body";
import Header from "./Header";
import LAS2Parser from "../../../parsers/las/LAS2Parser";
import { buildCellId } from "./utils";
import { defaultAppAttributesModel } from "./models/models";
import { appAttributesFieldMapping, sectionMapping } from "./models/mappings";
import { INPUT_TYPES } from "./constants";

import css from "./styles.scss";

const initialState = {
  activeInput: null,
  inputToCellIds: {},
  appAttributesModel: defaultAppAttributesModel,
  highlightedCellIdsMap: {},
  textHighlightedCellIdsMap: {}
};

const WellImporter = ({ files, onClickCancel }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [data, setData] = useState(null);

  const [state, dispatch] = useReducer(reducer, initialState);

  const { activeInput, appAttributesModel, inputToCellIds, highlightedCellIdsMap, highlightedTextCellIdsMap } = state;

  useEffect(() => {
    if (!isLoaded && files.length) {
      const parsedData = LAS2Parser.parse(files[0].fileText);
      setData(parsedData);
      setIsLoaded(true);
    }
  }, [isLoaded, files]);

  const updateSelection = (sectionName, key, rowIndex, columnIndex, cellData, inputId, cellIds, entireColumn) => {
    setHighlightedRowAndColumnListHelper(sectionName, key, rowIndex, columnIndex, cellData, entireColumn);
    dispatch(addInputToCellIds(inputId, cellIds));
  };

  const cellHandler = (
    currentState,
    updatedState,
    cellAlreadySelected,
    cellData,
    sectionName,
    key,
    rowIndex,
    columnIndex,
    inputId
  ) => {
    const cellId = buildCellId(sectionName, key, rowIndex, columnIndex);
    if (!cellAlreadySelected) {
      updateSelection(sectionName, key, rowIndex, columnIndex, cellData, inputId, [cellId]);
    } else {
      if (
        inputToCellIds[cellAlreadySelected] &&
        inputToCellIds[cellAlreadySelected].includes(cellId) &&
        inputId === cellAlreadySelected
      ) {
        dispatch(clearHighlightedCellIds());
        dispatch(removeHighlightedTextCellIds([cellId]));
        dispatch(removeInputToCellIds(inputId));
      }
    }
    dispatch(updateAttributesModel(activeInput, cellAlreadySelected, cellData, [cellId]));
  };

  const columnHandler = (
    currentState,
    updatedState,
    cellAlreadySelected,
    cellData,
    sectionName,
    key,
    rowIndex,
    columnIndex,
    inputId
  ) => {
    const sectionData = data[sectionName];
    const cellIds = sectionData.reduce((array, row, rowIndex) => {
      const id = buildCellId(sectionName, null, rowIndex, columnIndex);
      array.push(id);
      return array;
    }, []);

    if (!cellAlreadySelected) {
      updateSelection(sectionName, key, rowIndex, columnIndex, cellData, inputId, cellIds, true);
    } else {
      if (
        inputToCellIds[cellAlreadySelected] &&
        intersection(inputToCellIds[cellAlreadySelected], cellIds).length &&
        inputId === cellAlreadySelected
      ) {
        dispatch(clearHighlightedCellIds());
        dispatch(removeHighlightedTextCellIds(cellIds));
        dispatch(removeInputToCellIds(inputId));
      }
    }

    dispatch(updateAttributesModel(activeInput, cellAlreadySelected, cellData, cellIds, { rowIndex, columnIndex }));
  };

  const onClickCell = (sectionName, key, cellData, rowIndex, columnIndex) => {
    const cellAlreadySelected = Object.keys(inputToCellIds).find(inputId => {
      return inputToCellIds[inputId].includes(buildCellId(sectionName, key, rowIndex, columnIndex));
    });

    if (!activeInput) {
      // Look into activating the input if the cell has been selected
      return;
    }

    const currentState = cloneDeep(appAttributesModel);
    let actualCellData = cellData;
    if (activeInput.type === INPUT_TYPES.COLUMN) {
      actualCellData = `(${data[sectionName][0][columnIndex]})-end-(${
        data[sectionName][data[sectionName].length - 1][columnIndex]
      })`;
    }

    const updatedState = {
      ...currentState,
      [activeInput.sectionKey]: {
        ...currentState[activeInput.sectionKey],
        [activeInput.fieldKey]: {
          ...currentState[activeInput.sectionKey][activeInput.fieldKey],
          value: !cellAlreadySelected ? actualCellData : "",
          cellId: !cellAlreadySelected ? buildCellId(sectionName, key, rowIndex, columnIndex) : ""
        }
      }
    };

    const inputId = `${activeInput.sectionKey}-${activeInput.fieldKey}`;
    const handler = getHandler(activeInput.type);
    handler(
      currentState,
      updatedState,
      cellAlreadySelected,
      actualCellData,
      sectionName,
      key,
      rowIndex,
      columnIndex,
      inputId
    );
  };

  const getHandler = type => {
    switch (type) {
      case INPUT_TYPES.COLUMN:
        return columnHandler;
      default:
        return cellHandler;
    }
  };

  const setHighlightedRowAndColumnListHelper = (sectionName, key, rowIndex, columnIndex, cellData, entireColumn) => {
    if (!entireColumn) {
      const cellId = buildCellId(sectionName, key, rowIndex, columnIndex);
      dispatch(addHighlightedCellIds([cellId]));
    } else {
      const sectionData = data[sectionName];
      const highligtedCellIds = sectionData.map((row, rowIndex) => {
        return buildCellId(sectionName, null, rowIndex, columnIndex);
      });

      dispatch(addHighlightedCellIds(highligtedCellIds));
    }
  };

  const activateInput = newActiveInput => {
    if (
      activeInput &&
      newActiveInput &&
      activeInput.sectionKey === newActiveInput.sectionKey &&
      activeInput.fieldKey === newActiveInput.fieldKey
    ) {
      dispatch(setActiveInput(null));
      return;
    }

    let newActiveInputCellIds;
    if (newActiveInput) {
      newActiveInputCellIds = inputToCellIds[`${newActiveInput.sectionKey}-${newActiveInput.fieldKey}`];
      // Need to add it to the highlighted cells
      if (newActiveInputCellIds) {
        dispatch(addHighlightedCellIds(newActiveInputCellIds));
      } else {
        dispatch(clearHighlightedCellIds());
      }
    } else {
      dispatch(clearHighlightedCellIds());
    }

    const cellIds = Object.values(inputToCellIds).reduce((array, cellIds) => {
      if (intersection(cellIds, newActiveInputCellIds).length) {
        return array;
      }

      return array.concat(cellIds);
    }, []);

    dispatch(addHighlightedTextCellIds(cellIds));
    dispatch(setActiveInput(newActiveInput));
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
        activateInput={activateInput}
        highlightedRowAndColumnList={highlightedCellIdsMap}
        textHighlightedRowAndColumnList={highlightedTextCellIdsMap}
        activeInput={activeInput}
      />
    </div>
  );
};

WellImporter.propTypes = {
  onClickCancel: PropTypes.func.isRequired,
  files: PropTypes.array
};

export default WellImporter;
