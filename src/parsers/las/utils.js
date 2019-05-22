// TODO: this can most likely be re-used for version 3.0 in certain cases
// This is only for types V(version info), W(well info), C(curve info), P(parameters),
// refer to section 5.2 in the docs mentioned at the top of this file
export const parseLine = (line) => {
  /*
  * Delimiters:
  * a) The first dot in a line
  * b) The first space after the first dot in a line
  * c) The last colon of a line
  *
  * Examples:
  * STRT.M            9066.00  :Start Depth
  * VERS.                 1.2:    CWLS LOG ASCII STANDARD - VERSION 1.2
  * DEPT  .FT                                          : DEPTH
  * */

  const result = {
    mnemonic: null,
    units: null,
    data: null,
    description: null,
  };

  const dot = ".";
  const space = " ";
  const colon = ":";

  const dotIndex = line.indexOf(dot);
  const spaceIndex = line.indexOf(space, dotIndex);
  const colonIndex = line.lastIndexOf(colon); // Spec specifies last colon in line

  result.mnemonic = line.substring(0, dotIndex).trim();
  if (dotIndex !== spaceIndex - 1) {
    // contains units information
    result.units = line.substring(dotIndex + 1, spaceIndex).trim();
  }

  result.data = line.substring(spaceIndex + 1, colonIndex).trim();
  result.description = line.substring(colonIndex + 1).trim();
  return result;
};
