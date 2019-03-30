import React from 'react';
import ReactDOM from 'react-dom';
import { PropTypes } from 'prop-types';
import L from 'leaflet';
import { MapControl, withLeaflet } from 'react-leaflet';

class LegendControl extends MapControl {

    static defaultProps = { 
        children: PropTypes.object
    }

    componentWillMount() {
        const legend = L.control({ position: 'bottomright' });

        //  TO-DO: Add legend here
        const jsx = (
            <div {...this.props}>
                {this.props.children}
            </div>
        );

        legend.onAdd = function (map) {
            let div = L.DomUtil.create('div', '');
            ReactDOM.render(jsx, div);
            return div;
        };

        this.leafletElement = legend;
    }

    // Used by withLeaflet HOC to create element, otherwise component fails
    createLeafletElement() {
        return this.leafletElement
    }
}

export default withLeaflet(LegendControl);