import React from "react";
import PropTypes from "prop-types";
import upperFirst from "lodash/upperFirst";
import get from "lodash/get";
import classnames from "classnames";
import { buildCellId } from "../../utils";

import css from "./styles.scss";
import { useParsedFileSelector } from "../../selectors";

const truncatedMessage = "-------Log data intentionally truncated. All log data will be imported-------";

const nonDisplayFields = ["index"];

const Body = ({
  unlocked,
  className,
  onClickCell,
  highlightedRowAndColumnList,
  textHighlightedRowAndColumnList,
  onClickAsciiHeader
}) => {
  const { data } = useParsedFileSelector();
  const onClick = (sectionName, key, cellData, rowIndex, columnIndex) => () => {
    onClickCell(sectionName, key, cellData, rowIndex, columnIndex);
  };

  const renderAsciiSection = (sectionName, data) => {
    const headerData = Object.keys(data["curve"]);
    const header = (
      <tr key="ascii-header">
        {headerData.map((headerName, columnIndex) => {
          return (
            <td key={`ascii-header-${headerName}`} onClick={() => onClickAsciiHeader(headerName, columnIndex)}>
              {headerName}
            </td>
          );
        })}
      </tr>
    );

    const first = data[sectionName].slice(0, 30).map((arrayOfValues, index) => {
      return (
        <tr key={`${sectionName}-${index}`}>
          {arrayOfValues.map((value, valueIndex) => {
            const cellData = data[sectionName][index][valueIndex];
            const cellId = buildCellId(sectionName, null, index, valueIndex, cellData);
            const cellHighlighted = get(highlightedRowAndColumnList, cellId, false);
            const textHighlighted = get(textHighlightedRowAndColumnList, cellId, false);

            return (
              <td
                onClick={onClick(sectionName, null, value, index, valueIndex)}
                key={`${sectionName}-${index}-${valueIndex}`}
                className={classnames({
                  [css.selectedCell]: cellHighlighted,
                  [css.selectedText]: textHighlighted
                })}
              >
                {value}
              </td>
            );
          })}
        </tr>
      );
    });

    const last = data[sectionName]
      .slice(data[sectionName].length - 30, data[sectionName].length)
      .map((arrayOfValues, index) => {
        return (
          <tr key={`${sectionName}-${index + first.length}`}>
            {arrayOfValues.map((value, valueIndex) => {
              const cellData = data[sectionName][index][valueIndex];
              const cellId = buildCellId(
                sectionName,
                null,
                index + data[sectionName].length - 30,
                valueIndex,
                cellData
              );
              const cellHighlighted = get(highlightedRowAndColumnList, cellId, false);
              const textHighlighted = get(textHighlightedRowAndColumnList, cellId, false);
              return (
                <td
                  onClick={onClick(sectionName, null, value, index, valueIndex)}
                  key={`${index + first.length}-${valueIndex}`}
                  className={classnames({
                    [css.selectedCell]: cellHighlighted,
                    [css.selectedText]: textHighlighted
                  })}
                >
                  {value}
                </td>
              );
            })}
          </tr>
        );
      });

    const middle = (
      <tr key={`${sectionName}-truncation-row`}>
        <td
          key={`${sectionName}-truncation-data`}
          colSpan={data[sectionName][0].length}
          className={css.truncationMessage}
        >
          {truncatedMessage}
        </td>
      </tr>
    );
    return [header, ...first, middle, ...last];
  };

  const renderSection = (sectionName, data) => {
    return Object.keys(data[sectionName]).map((key, rowIndex) => {
      const rowData = data[sectionName][key];
      return (
        <tr key={`${sectionName}-${key}-${rowIndex}`}>
          {Object.keys(rowData).reduce((columns, sectionItemKey, columnIndex) => {
            const cellData = rowData[sectionItemKey];
            const cellId = buildCellId(sectionName, key, rowIndex, columnIndex);
            const cellHighlighted = get(highlightedRowAndColumnList, cellId, false);

            const textHighlighted = get(textHighlightedRowAndColumnList, cellId, false);

            if (columnIndex === 3) {
              columns.push(
                <td
                  key={`${sectionName}-${sectionItemKey}-${rowIndex}-${columnIndex}`}
                  onClick={onClick(sectionName, key, cellData, rowIndex, columnIndex)}
                >
                  :
                </td>
              );
            }

            if (!nonDisplayFields.includes(sectionItemKey)) {
              columns.push(
                <td
                  key={`${sectionItemKey}-${rowIndex}-${columnIndex}`}
                  onClick={onClick(sectionName, key, cellData, rowIndex, columnIndex)}
                  className={classnames({
                    [css.selectedCell]: cellHighlighted,
                    [css.selectedText]: textHighlighted
                  })}
                >
                  {columnIndex === 1 ? "." : ""}
                  {cellData}
                </td>
              );
            }

            return columns;
          }, [])}
        </tr>
      );
    });
  };

  return (
    <div className={className}>
      {Object.keys(data).map((sectionName, index) => {
        const importContentTableClass = classnames({
          [css.importContentTable]: true,
          [css.unlocked]: unlocked
        });

        return (
          <table key={`table-${sectionName}`} className={importContentTableClass}>
            <tbody key={`tbody-${sectionName}`}>
              <tr key={`${sectionName}-title-row`}>
                <td key={`${sectionName}-title-table-data`} id={`${sectionName}`}>
                  ~{upperFirst(sectionName)}
                </td>
                <td id="row_0_col_1" colSpan="17" />
              </tr>
              {sectionName !== "ascii" ? renderSection(sectionName, data) : renderAsciiSection(sectionName, data)}
            </tbody>
          </table>
        );
      })}
    </div>
  );
};

Body.defaultProps = {
  unlocked: true,
  highlightedRowAndColumnList: null,
  textHighlightedRowAndColumnList: null
};

Body.propTypes = {
  onClickCell: PropTypes.func.isRequired,
  onClickAsciiHeader: PropTypes.func.isRequired,
  className: PropTypes.string,
  highlightedRowAndColumnList: PropTypes.object,
  textHighlightedRowAndColumnList: PropTypes.object,
  unlocked: PropTypes.bool
};

export default Body;
