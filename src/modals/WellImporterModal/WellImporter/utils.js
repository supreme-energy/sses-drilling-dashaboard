export const buildCellId = (sectionName, key, rowIndex, columnIndex, cellData) => {
  return `${sectionName}-${key ? key + "-" : ""}${rowIndex}-${columnIndex}`;
};
