import ReactDOM from "react-dom";
import { PropTypes } from "prop-types";
import L from "leaflet";
import { MapControl, withLeaflet } from "react-leaflet";

class LegendControl extends MapControl {
  static defaultProps = {
    children: PropTypes.object
  };

  componentWillMount() {
    const { position } = this.props;
    const legend = L.control({ position });
    legend.onAdd = function(map) {
      let div = L.DomUtil.create("div");

      return div;
    };

    this.leafletElement = legend;
  }

  render() {
    return this.leafletElement._container
      ? ReactDOM.createPortal(this.props.children, this.leafletElement._container)
      : null;
  }

  // Used by withLeaflet HOC to create element, otherwise component fails
  createLeafletElement() {
    return this.leafletElement;
  }
}

export default withLeaflet(LegendControl);
