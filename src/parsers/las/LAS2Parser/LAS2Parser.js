// LAS 2.0 Spec: http://www.cwls.org/wp-content/uploads/2017/02/Las2_Update_Feb2017.pdf
import isEmpty from "lodash/isEmpty";

import { parseLine } from "../utils";
import VersionRequiredFields from "./constants/VersionRequiredFields";
import Sections from "./constants/Sections";

const baseConverter = (lines, saveIndex) => {
  return lines.reduce((version, line, index) => {
    if (isEmpty(line)) {
      return version;
    }

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
      if (!isEmpty(line)) {
        values.push(line.split(" ").reduce((values, value) => {
          if (value !== "") {
            values.push(value);
          }

          return values;
        }, []));
      }
      return values;
    }, []);
  } else {
    const values = [];
    let currentLineValues;
    lines.forEach((line, index) => {
      if (isEmpty(line)) {
        return;
      }

      const splitLine = line.split(" ").filter(part => part !== "");
      if (splitLine.length === 1) {
        if (index !== 0) {
          values.push(currentLineValues);
        }

        currentLineValues = [];
        currentLineValues.push(splitLine[ 0 ]);
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

const optionsConverter = (lines) => {
  return lines.reduce((optionText, line) => {
    if (!isEmpty(line)) {
      optionText = optionText.concat(line);
    }

    return optionText;
  }, "");
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
    [ Sections.OPTIONAL ]: optionsConverter,
    [ Sections.PARAMETER ]: baseConverter,
    [ Sections.ASCII ]: asciiConverter,
  };

  parse = (text) => {
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

export default new Parser();
