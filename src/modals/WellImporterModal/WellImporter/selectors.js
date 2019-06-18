import { csvParse } from "d3-dsv";
import LAS2Parser from "../../../parsers/las/LAS2Parser";
import memoizeOne from "memoize-one";
import { useSelector } from "react-redux";

const parseFile = memoizeOne(files => {
  if (!files || !files.length) {
    return { data: null, extension: null };
  }
  const [file] = files;
  const extension = file.file.name.split(".").pop();
  let data = null;
  switch (extension) {
    case "las":
      data = LAS2Parser.parse(file.fileText);
      break;
    case "csv":
      data = csvParse(file.fileText);
      break;
    default:
      data = null;
  }

  return { data, extension };
});

export function useParsedFileSelector() {
  return useSelector(state => parseFile(state.files.files));
}

export function getFieldValue(csvSelection, key, data) {
  const { selectedColumn, selectedRow } = csvSelection[key] || {};
  if (selectedColumn) {
    if (selectedRow === null) {
      const start = data[0][selectedColumn];
      const end = data[data.length - 1][selectedColumn];
      return `(${start})-end-(${end})`;
    }

    return data[selectedRow][selectedColumn];
  }

  return "";
}

const getSelectionByColumnAndRow = memoizeOne(selectionByField => {
  const selection = Object.values(selectionByField).reduce((acc, next) => {
    const colSelection = acc[next.selectedColumn] || {};
    if (next.selectedRow !== null) {
      colSelection[next.selectedRow] = true;
    }
    acc[next.selectedColumn] = colSelection;
    return acc;
  }, {});

  return selection;
});

export function isSelected(row, column, selectionByField) {
  const selectionByColumnAndRow = getSelectionByColumnAndRow(selectionByField);
  const columnSelection = selectionByColumnAndRow[column];
  return columnSelection && ((row === null && !Object.values(columnSelection).length) || columnSelection[row]);
}

export function isActive(row, column, selectionByField, activeField) {
  const activeSelection = selectionByField[activeField];
  return (
    activeSelection &&
    (column === activeSelection.selectedColumn && (row === activeSelection.selectedRow || row === null))
  );
}
