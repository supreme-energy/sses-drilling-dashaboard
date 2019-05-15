import LAS2Parser from "src/parsers/las/LAS2Parser";
import Sections from "src/parsers/las/LAS2Parser/constants/Sections";
import { parseLine } from "src/parsers/las/utils";

import HeaderResult from "./data/sections/header/result";
import HeaderInfoText from "./data/sections/header/HeaderInfo.las";
import CurveResult from "./data/sections/curve/result";
import CurveInfo from "./data/sections/curve/CurveInfo.las";
import WellResult from "./data/sections/well/result";
import WellInfo from "./data/sections/well/WellInfo.las";
import OptionalResult from "./data/sections/optional/result";
import OptionalInfo from "./data/sections/optional/OptionalInfo.las";
import ParameterResult from "./data/sections/parameter/result";
import ParameterInfo from "./data/sections/parameter/ParameterInfo.las";
import AsciiResult from "./data/sections/ascii/result";
import AsciiInfo from "./data/sections/ascii/AsciiInfo.las";
import AsciiInfoResult from "./data/sections/ascii/wrapped/result";
import AsciiInfoWrapped from "./data/sections/ascii/wrapped/AsciiInfoWrapped.las";

const sections = {
  [ Sections.VERSION ]: {
    result: HeaderResult,
    text: HeaderInfoText,
  },
  [ Sections.CURVE ]: {
    result: CurveResult,
    text: CurveInfo,
  },
  [ Sections.WELL ]: {
    result: WellResult,
    text: WellInfo,
  },
  [ Sections.PARAMETER ]: {
    result: ParameterResult,
    text: ParameterInfo,
  },
  [ Sections.OPTIONAL ]: {
    result: OptionalResult,
    text: OptionalInfo,
  },
  [ Sections.PARAMETER ]: {
    result: ParameterResult,
    text: ParameterInfo,
  },
  [Sections.ASCII]: {
    result: AsciiResult,
    text: AsciiInfo,
  }
};

describe("Parser Utils tests", () => {
  test("parseLine(): should successfully parse line with unit", () => {
    const line = "STRT.M            9066.00  :Start Depth";
    const expectedResult = {
      mnemonic: "STRT",
      units: "M",
      data: "9066.00",
      description: "Start Depth",
    };

    const result = parseLine(line);
    expect(result).toBeTruthy();
    expect(expectedResult).toEqual(result);
  });

  test("parseLine(): should successfully parses line without unit", () => {
    const line = "VERS.                 1.2:    CWLS LOG ASCII STANDARD - VERSION 1.2";
    const expectedResult = {
      mnemonic: "VERS",
      units: null,
      data: "1.2",
      description: "CWLS LOG ASCII STANDARD - VERSION 1.2",
    };

    const result = parseLine(line);
    expect(result).toBeTruthy();
    expect(expectedResult).toEqual(result);
  });
});

describe("LAS2Parser tests", () => {
  Object.keys(sections).forEach((sectionName) => {
    const section = sections[ sectionName ];
    test(`should parse the ${sectionName} section of a LAS file`, () => {
      const parsed = LAS2Parser.parse(section.text);
      expect(parsed).toBeTruthy();
      expect(parsed[ sectionName ]).toEqual(section.result);
    });
  });

  test("should handle parsing an ascii section in wrapped mode", () => {
    const parsed = LAS2Parser.parse(AsciiInfoWrapped);
    expect(parsed).toBeTruthy();
    expect(parsed.ascii).toEqual(AsciiInfoResult);
  });
});
