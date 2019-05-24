export const buildCellId = (sectionName, key, rowIndex, columnIndex) => {
  return `${sectionName}-${key ? key + "-" : ""}${rowIndex}-${columnIndex}`;
};
