import { useEffect } from "react";
import { changeWellAccessTimestamp } from "../WellExplorer/store";
import { connect } from "react-redux";
import PropTypes from "prop-types";

function WellUpdate({
  match: {
    params: { wellId }
  },
  changeWellAccessTimestamp
}) {
  useEffect(
    function updateWellTimestamp() {
      if (wellId) {
        changeWellAccessTimestamp(wellId);
      }
    },
    [wellId, changeWellAccessTimestamp]
  );

  return null;
}

WellUpdate.propTypes = { match: PropTypes.object, changeWellAccessTimestamp: PropTypes.func };

const mapDispatchToProps = {
  changeWellAccessTimestamp
};

export default connect(
  null,
  mapDispatchToProps
)(WellUpdate);
