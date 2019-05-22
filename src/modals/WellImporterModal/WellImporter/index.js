import { connect } from "react-redux";

import WellImporter from "./WellImporter";

const mapStateToProps = state => ({
  files: state.files.files
});

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WellImporter);
