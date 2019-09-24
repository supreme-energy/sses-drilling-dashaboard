import { useEffect } from "react";
import { changeWellAccessTimestamp } from "../WellExplorer/store";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { useWellIdContainer } from "./Containers";

function WellUpdate({ changeWellAccessTimestamp }) {
  const { wellId } = useWellIdContainer();
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

WellUpdate.propTypes = { changeWellAccessTimestamp: PropTypes.func };

const mapDispatchToProps = {
  changeWellAccessTimestamp
};

export default connect(
  null,
  mapDispatchToProps
)(WellUpdate);
