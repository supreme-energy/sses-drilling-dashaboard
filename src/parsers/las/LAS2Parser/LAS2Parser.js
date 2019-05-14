// LAS 2.0 Spec: http://www.cwls.org/wp-content/uploads/2017/02/Las2_Update_Feb2017.pdf
import VersionRequiredFields from "./constants/VersionRequiredFields";
import Sections from "./constants/Sections";

const baseConverter = (lines, saveIndex) => {
  return lines.reduce((version, line, index) => {
    const parsedLine = parseLine(line);

    if (saveIndex) {
      parsedLine.index = index; // we need to keep track of these so that later we can determine ASCII section
    }

    let fieldName = parsedLine.mnemonic;
    version[ fieldName ] = parsedLine;

    return version;
  }, {});
};

const curveConverter = (lines) => baseConverter(lines, true);

const asciiConverter = (lines, version) => {
  if (version[ VersionRequiredFields.WRAP ].data.toLowerCase().includes("no")) {
    return lines.reduce((values, line) => {
      values.push(line.split(" ").reduce((values, value) => {
        if (value !== "") {
          values.push(value);
        }

        return values;
      }, []));
      return values;
    }, []);
  } else {
    const values = [];
    let currentLineValues;
    lines.forEach((line, index) => {
      const splitLine = line.split(" ").filter(part => part !== "");
      if (splitLine.length === 1) {
        if (index !== 0) {
          values.push(currentLineValues);
        }

        currentLineValues = [];
        currentLineValues.push(splitLine[0]);
      } else {
        // if the file is formatted properly, this should never be an issue.
        if (!currentLineValues) {
          console.error("There is an issue with the Ascii section of the file that was imported.");
          return;
        }

        currentLineValues = currentLineValues.concat(splitLine);
      }
    });

    values.push(currentLineValues);
    return values;
  }
};

// TODO: need to check required fields and make sure all exist after parsing
class Parser {
  returnRegex = "\u000D";
  newLineRegex = "\u000A";
  sectionDelimiters = {
    "~V": Sections.VERSION,
    "~W": Sections.WELL,
    "~P": Sections.PARAMETER,
    "~C": Sections.CURVE,
    "~O": Sections.OPTIONAL,
    "~A": Sections.ASCII,
  };

  sectionConverters = {
    [ Sections.VERSION ]: baseConverter,
    [ Sections.WELL ]: baseConverter,
    [ Sections.CURVE ]: curveConverter,
    [ Sections.OPTIONAL ]: baseConverter,
    [ Sections.PARAMETER ]: baseConverter,
    [ Sections.ASCII ]: asciiConverter
  };

  convert = (text) => {
    const lines = text.replace(`/${this.returnRegex}/g`, this.newLineRegex).split(this.newLineRegex);

    let currentSectionName = null;
    const sections = lines.reduce((sections, line) => {
      if (line.startsWith("~")) {
        const sectionName = this.getSectionName(line);
        sections[ sectionName ] = { lines: [] };
        currentSectionName = sectionName;
        return sections;
      }

      // ignore comments
      if (line.startsWith("#")) {
        return sections;
      }

      if (line === this.returnRegex || line === this.newLineRegex) {
        return sections;
      }

      if (!currentSectionName) {
        console.error("Encountered a line before a section. This should not be possible");
        return sections;
      }

      if (!sections[ currentSectionName ]) {
        console.error(`There is no section with the section name ${currentSectionName}`);
        return sections;
      }

      sections[ currentSectionName ].lines.push(line);
      return sections;
    }, {});

    const json = {};
    Object.keys(sections).forEach((sectionName) => {
      const section = sections[ sectionName ];
      json[ sectionName ] = this.convertSection(
        sectionName,
        section.lines,
        json[ Sections.VERSION ],
        json[ Sections.CURVE ],
      );
    });

    return json;
  };

  getSectionName = (line) => {
    const sectionFlag = line.trim().toUpperCase().substring(0, 2);
    return this.sectionDelimiters[ sectionFlag ];
  };

  getSectionConverter = (name) => {
    return this.sectionConverters[ name ];
  };

  convertSection = (name, sectionLines, versionInfo, curveInfo) => {
    const sectionConverter = this.getSectionConverter(name);
    if (!sectionConverter) {
      return {};
    }

    return sectionConverter(sectionLines, versionInfo, curveInfo);
  };
}

// TODO: this can most likely be re-used for version 3.0 in certain cases
// This is only for types V(version info), W(well info), C(curve info), P(parameters),
// refer to section 5.2 in the docs mentioned at the top of this file
const parseLine = (line) => {
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

export default new Parser();
