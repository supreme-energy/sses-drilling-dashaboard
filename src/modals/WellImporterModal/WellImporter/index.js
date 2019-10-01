import { connect } from "react-redux";

import WellImporter from "./WellImporter";

import { createContainer } from "unstated-next";
import { useReducer } from "react";
import reducer, { initialState } from "./state/reducer";

function useWellImporter() {
  return useReducer(reducer, initialState);
}

export const { Provider: WellImporterProvider, useContainer: useWellImporterContainer } = createContainer(
  useWellImporter
);

const mapStateToProps = state => ({
  files: state.files.files
});

export default connect(mapStateToProps)(WellImporter);
