import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import cloneDeep from "lodash/cloneDeep";

import Body from "./Body";
import Header from "./Header";
import LAS2Parser from "../../../parsers/las/LAS2Parser";
import { buildCellId } from "./utils";
import { defaultAppAttributesModel } from "./models";
import { appAttributesFieldMapping, sectionMapping } from "./mappings";

import css from "./styles.scss";

const WellImporter = ({ files, onClickCancel }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [data, setData] = useState(null);
  const [appAttributesModel, setAppAttributesModel] = useState(defaultAppAttributesModel);
  const [activeInput, setActiveInput] = useState(null);
  const [inputToCellId, setInputToCellId] = useState({});
  const [highlightedRowAndColumnList, setHighlightedRowAndColumnList] = useState(null);
  const [textHighlightedRowAndColumnList, setTextHighlightedRowAndColumnList] = useState(null);

  const onClickCell = (sectionName, key, cellData, rowIndex, columnIndex) => {
    const cellAlreadySelected = Object.keys(inputToCellId).find(inputId => {
      return inputToCellId[inputId] === buildCellId(sectionName, key, rowIndex, columnIndex, cellData);
    });

    if (activeInput) {
      const currentState = cloneDeep(appAttributesModel);
      if (!activeInput.type || activeInput.type === "cell") {
        const updatedState = {
          ...currentState,
          [activeInput.sectionKey]: {
            ...currentState[activeInput.sectionKey],
            [activeInput.fieldKey]: {
              ...currentState[activeInput.sectionKey][activeInput.fieldKey],
              value: !cellAlreadySelected ? cellData : "",
              cellId: !cellAlreadySelected ? buildCellId(sectionName, key, rowIndex, columnIndex, cellData) : ""
            }
          }
        };

        const inputId = `${activeInput.sectionKey}-${activeInput.fieldKey}`;
        const cellId = buildCellId(sectionName, key, rowIndex, columnIndex, cellData);
        if (!cellAlreadySelected) {
          setAppAttributesModel(updatedState);
          setHighlightedRowAndColumnListHelper(sectionName, key, rowIndex, columnIndex, cellData);
          setInputToCellId({
            ...inputToCellId,
            [inputId]: cellId
          });
        } else {
          if (inputToCellId[cellAlreadySelected] === cellId && inputId === cellAlreadySelected) {
            setHighlightedRowAndColumnList({});
            const updatedTextHighlightedRowAndColumnList = { ...textHighlightedRowAndColumnList };
            delete updatedTextHighlightedRowAndColumnList[cellId];
            setTextHighlightedRowAndColumnList(updatedTextHighlightedRowAndColumnList);
            const updatedInputToCellId = { ...inputToCellId };
            delete updatedInputToCellId[inputId];
            setInputToCellId(updatedInputToCellId);
          }
        }
      } else if (activeInput.type === "column") {
        const columnCellData = `(${data[sectionName][0][columnIndex]})-end-(${
          data[sectionName][data[sectionName].length - 1][columnIndex]
        })`;

        const updatedState = {
          ...currentState,
          [activeInput.sectionKey]: {
            ...currentState[activeInput.sectionKey],
            [activeInput.fieldKey]: {
              ...currentState[activeInput.sectionKey][activeInput.fieldKey],
              value: !cellAlreadySelected ? columnCellData : "",
              cellId: !cellAlreadySelected ? buildCellId(sectionName, key, rowIndex, columnIndex, cellData) : ""
            }
          }
        };

        setAppAttributesModel(updatedState);
        setHighlightedRowAndColumnListHelper(sectionName, key, rowIndex, columnIndex, cellData, true);
      }
    }
  };

  const setHighlightedRowAndColumnListHelper = (sectionName, key, rowIndex, columnIndex, cellData, entireColumn) => {
    if (!entireColumn) {
      const cellId = buildCellId(sectionName, key, rowIndex, columnIndex, cellData);
      setHighlightedRowAndColumnList({
        [cellId]: true
      });
    } else {
      const sectionData = data[sectionName];
      const highlighted = sectionData.reduce((map, row, rowIndex) => {
        const id = buildCellId(sectionName, null, rowIndex, columnIndex);
        map[id] = true;
        return map;
      }, {});

      setHighlightedRowAndColumnList(highlighted);
    }
  };

  useEffect(() => {
    if (!isLoaded && files.length) {
      const parsedData = LAS2Parser.parse(files[0].fileText);
      setData(parsedData);
      setIsLoaded(true);
    }
  }, [isLoaded, files]);

  const activateInput = newActiveInput => {
    if (
      activeInput &&
      newActiveInput &&
      activeInput.sectionKey === newActiveInput.sectionKey &&
      activeInput.fieldKey === newActiveInput.fieldKey
    ) {
      setActiveInput(null);
      return;
    }

    let newActiveInputCellValue;
    if (newActiveInput) {
      newActiveInputCellValue = inputToCellId[`${newActiveInput.sectionKey}-${newActiveInput.fieldKey}`];
      // Need to add it to the highlighted cells
      if (newActiveInputCellValue) {
        setHighlightedRowAndColumnList({ [newActiveInputCellValue]: true });
      } else {
        setHighlightedRowAndColumnList({});
      }
    } else {
      setHighlightedRowAndColumnList({});
    }

    const updatedTextHighlightedRowAndColumnList = Object.values(inputToCellId).reduce((map, cellId) => {
      if (cellId === newActiveInputCellValue) {
        return map;
      }

      return { ...map, [cellId]: true };
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

WellImporter.propTypes = {
  onClickCancel: PropTypes.func.isRequired,
  files: PropTypes.array
};

export default WellImporter;
