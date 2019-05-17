import React from "react";
import PropTypes from "prop-types";
import upperFirst from "lodash/upperFirst";
import get from "lodash/get";
import classnames from "classnames";

import css from "./styles.scss";

const truncatedMessage = "-------Log data intentionally truncated. All log data will be imported-------";

const nonDisplayFields = [ "index" ];

const Body = ({
                unlocked,
                data,
                className,
                onClickCell,
                highlightedRowAndColumnList = { version: [ [ true, true ] ] },
              }) => {
  const onClick = (rowIndex, columnIndex, cellData) => () => {
    onClickCell(rowIndex, columnIndex, cellData);
  };

  const renderAsciiSection = (sectionName, data) => {
    const first = data[ sectionName ].slice(0, 30).map((arrayOfValues, index) => {
      return (
        <tr
          key={`${sectionName}-${index}`}
        >
          {arrayOfValues.map((value, valueIndex) => <td key={`${sectionName}-${index}-${valueIndex}`}>{value}</td>)}
        </tr>
      );
    });

    const last = data[ sectionName ]
      .slice(data[ sectionName ].length - 30, data[ sectionName ].length)
      .map((arrayOfValues, index) => (
        <tr
          key={`${sectionName}-${index + first.length}`}
        >
          {arrayOfValues.map((value, valueIndex) => (
            <td
              key={`${index + first.length}-${valueIndex}`}
            >
              {value}
            </td>
          ))}
        </tr>
        ),
      );

    const middle = (
      <tr key={`${sectionName}-truncation-row`}>
        <td key={`${sectionName}-truncation-data`} colSpan={data[ sectionName ][ 0 ].length}
          className={css.truncationMessage}>
          {truncatedMessage}
        </td>
      </tr>
    );
    return [ ...first, middle, ...last ];
  };

  const renderSection = (sectionName, data) => {
    return Object.keys(data[ sectionName ]).map((key, rowIndex) => {
      const rowData = data[ sectionName ][ key ];

      return (
        <tr key={`${sectionName}-${key}-${rowIndex}`}>
          {Object.keys(rowData).reduce((columns, sectionItemKey, columnIndex) => {
            const cellData = rowData[ sectionItemKey ];
            const isSelected = get(
              highlightedRowAndColumnList,
              [ sectionName, columnIndex, rowIndex ],
              false,
            );

            if (columnIndex === 3) {
              columns.push(
                <td
                  key={`${sectionName}-${sectionItemKey}-${rowIndex}-${columnIndex}`}
                  onClick={onClick(rowIndex, columnIndex, cellData)}
                >
                  :
                </td>,
              );
            }

            if (!nonDisplayFields.includes(sectionItemKey)) {
              columns.push(
                <td
                  key={`${sectionItemKey}-${rowIndex}-${columnIndex}`}
                  onClick={onClick(rowIndex, columnIndex, cellData)}
                  className={classnames({
                    [ css.selectedCell ]: isSelected,
                  })}
                >
                  {columnIndex === 1 ? "." : ""}{cellData}
                </td>,
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
      {
        Object.keys(data).map((sectionName, index) => {
          const importContentTableClass = classnames({
            [ css.importContentTable ]: true,
            [ css.unlocked ]: unlocked,
          });

          return (
            <table key={`table-${sectionName}`} className={importContentTableClass}>
              <tbody key={`tbody-${sectionName}`}>
                <tr key={`${sectionName}-title-row`}>
                  <td key={`${sectionName}-title-table-data`} id={`${sectionName}`}>~{upperFirst(sectionName)}</td>
                  <td id="row_0_col_1" colSpan="17" />
                </tr>
                {
                  sectionName !== "ascii"
                    ? renderSection(sectionName, data)
                    : renderAsciiSection(sectionName, data)
                }
              </tbody>
            </table>
          );
        })
      }
    </div>
  );
};

Body.defaultProps = {
  unlocked: true,
};

Body.propTypes = {
  data: PropTypes.object.isRequired,
  onClickCell: PropTypes.func.isRequired,
  className: PropTypes.string,
  highlightedRowAndColumnList: PropTypes.object,
  unlocked: PropTypes.bool,
};

export default Body;
