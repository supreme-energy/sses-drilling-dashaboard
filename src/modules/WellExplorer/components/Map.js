import React from 'react'
import { Map, TileLayer } from 'react-leaflet';

export default class MapType extends React.Component {
    state = {
        latlng: {
            lat: 30.0902,
            lng: -95.7129,
        },
        zoom: 5,
        animate: false
    }

    handleClick = (e) => {
        this.setState({
            latlng: e.latlng,
        })
    }

    toggleAnimate = () => {
        this.setState({
            animate: !this.state.animate,
        })
    }

    render() {
        return (
            <div style={{ textAlign: 'center' }}>
                <label>
                    <input
                        checked={this.state.animate}
                        onChange={this.toggleAnimate}
                        type="checkbox"
                    />
                    Animate panning
        </label>
                <Map
                    animate={this.state.animate}
                    center={this.state.latlng}
                    length={4}
                    style={{height: 300 }}
                    onClick={this.handleClick}
                    zoom={13}>
                    <TileLayer
                        attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                </Map>
            </div>
        )
    }
}