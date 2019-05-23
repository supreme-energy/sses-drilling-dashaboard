import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import cloneDeep from "lodash/cloneDeep";
import intersection from "lodash/intersection";

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
  const [inputToCellIds, setInputToCellIds] = useState({});
  const [highlightedRowAndColumnList, setHighlightedRowAndColumnList] = useState(null);
  const [textHighlightedRowAndColumnList, setTextHighlightedRowAndColumnList] = useState(null);

  useEffect(() => {
    if (!isLoaded && files.length) {
      const parsedData = LAS2Parser.parse(files[0].fileText);
      setData(parsedData);
      setIsLoaded(true);
    }
  }, [isLoaded, files]);

  const onClickCell = (sectionName, key, cellData, rowIndex, columnIndex) => {
    const cellAlreadySelected = Object.keys(inputToCellIds).find(inputId => {
      return inputToCellIds[inputId].includes(buildCellId(sectionName, key, rowIndex, columnIndex, cellData));
    });

    if (activeInput) {
      const currentState = cloneDeep(appAttributesModel);
      if (activeInput.type === "cell") {
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
          setHighlightedRowAndColumnListHelper(sectionName, key, rowIndex, columnIndex, cellData);
          setInputToCellIds({
            ...inputToCellIds,
            [inputId]: [cellId]
          });
        } else {
          if (
            inputToCellIds[cellAlreadySelected] &&
            inputToCellIds[cellAlreadySelected].includes(cellId) &&
            inputId === cellAlreadySelected
          ) {
            setHighlightedRowAndColumnList({});
            const updatedTextHighlightedRowAndColumnList = { ...textHighlightedRowAndColumnList };
            delete updatedTextHighlightedRowAndColumnList[cellId];
            setTextHighlightedRowAndColumnList(updatedTextHighlightedRowAndColumnList);
            const updatedInputToCellIds = { ...inputToCellIds };
            delete updatedInputToCellIds[inputId];
            setInputToCellIds(updatedInputToCellIds);
          }
        }
        setAppAttributesModel(updatedState);
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

        const inputId = `${activeInput.sectionKey}-${activeInput.fieldKey}`;
        setAppAttributesModel(updatedState);
        const sectionData = data[sectionName];

        const cellIds = sectionData.reduce((array, row, rowIndex) => {
          const id = buildCellId(sectionName, null, rowIndex, columnIndex);
          array.push(id);
          return array;
        }, []);

        if (!cellAlreadySelected) {
          setHighlightedRowAndColumnListHelper(sectionName, key, rowIndex, columnIndex, cellData, true);
          setInputToCellIds({
            ...inputToCellIds,
            [inputId]: cellIds
          });
        } else {
          if (
            inputToCellIds[cellAlreadySelected] &&
            intersection(inputToCellIds[cellAlreadySelected], cellIds).length &&
            inputId === cellAlreadySelected
          ) {
            setHighlightedRowAndColumnList({});
            const updatedTextHighlightedRowAndColumnList = { ...textHighlightedRowAndColumnList };
            cellIds.forEach(cellId => {
              delete updatedTextHighlightedRowAndColumnList[cellId];
            });

            setTextHighlightedRowAndColumnList(updatedTextHighlightedRowAndColumnList);
            const updatedInputToCellIds = { ...inputToCellIds };
            delete updatedInputToCellIds[inputId];
            setInputToCellIds(updatedInputToCellIds);
          }
        }
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

    let newActiveInputCellValues;
    if (newActiveInput) {
      newActiveInputCellValues = inputToCellIds[`${newActiveInput.sectionKey}-${newActiveInput.fieldKey}`];
      // Need to add it to the highlighted cells
      if (newActiveInputCellValues) {
        const highlightedRowAndColumList = newActiveInputCellValues.reduce((map, value) => {
          map[value] = true;
          return map;
        }, {});

        setHighlightedRowAndColumnList(highlightedRowAndColumList);
      } else {
        setHighlightedRowAndColumnList({});
      }
    } else {
      setHighlightedRowAndColumnList({});
    }

    const updatedTextHighlightedRowAndColumnList = Object.values(inputToCellIds).reduce((map, cellIds) => {
      if (intersection(cellIds, newActiveInputCellValues).length) {
        return map;
      }

      return {
        ...map,
        ...cellIds.reduce((cellIdMap, cellId) => {
          cellIdMap[cellId] = true;
          return cellIdMap;
        }, {})
      };
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
        inputToCellId={inputToCellIds}
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
