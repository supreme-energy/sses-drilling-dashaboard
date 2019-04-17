import ReactDOM from "react-dom";
import { PropTypes } from "prop-types";
import L from "leaflet";
import { MapControl, withLeaflet } from "react-leaflet";

class LegendControl extends MapControl {
  static defaultProps = {
    children: PropTypes.object
  };

  constructor(props) {
    super(props);
    this._container = L.DomUtil.create("div", "");
    const { position } = this.props;
    const legend = L.control({ position });

    legend.onAdd = map => {
      return this._container;
    };

    this.leafletElement = legend;
  }

  render() {
    return ReactDOM.createPortal(this.props.children, this._container);
  }

  // Used by withLeaflet HOC to create element, otherwise component fails
  createLeafletElement() {
    return this.leafletElement;
  }
}

export default withLeaflet(LegendControl);
