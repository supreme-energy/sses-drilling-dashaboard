import { connect } from "react-redux";

import WellImporter from "./WellImporter";

const mapStateToProps = state => ({
  files: state.files.files
});

export default connect(mapStateToProps)(WellImporter);
