import { connect } from "react-redux";

import WellImporter from "./WellImporter";

const mapStateToProps = (state) => ({
  file: state.file
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(WellImporter);
