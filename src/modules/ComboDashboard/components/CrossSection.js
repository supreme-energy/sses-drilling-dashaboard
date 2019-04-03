import React, { Component } from "react";
import * as PIXI from "pixi.js";
import PropTypes from "prop-types";

class CrossSection extends Component {
  constructor(props) {
    super(props);
    this.canvas = React.createRef();
    this.app = new PIXI.Application(600, 400);
    this.message = new PIXI.Text("", {
      fontFamily: "Arial",
      fontStyle: "italic",
      fontWeight: "bold",
      fill: "#fff",
      wordWrap: true,
      wordWrapWidth: 440
    });
  }

  componentWillMount() {}

  componentDidMount() {
    this.canvas.current.appendChild(this.app.view);

    this.message.x = 30;
    this.message.y = 30;

    this.app.stage.addChild(this.message);
    this.app.start();
  }

  componentWillReceiveProps(nextProps) {}

  shouldComponentUpdate(nextProps, nextState) {}

  componentWillUpdate(nextProps, nextState) {}

  componentDidUpdate(prevProps, prevState) {}

  componentWillUnmount() {
    this.app.stop();
  }

  render() {
    this.message.text = this.props.message;

    return <div ref={this.canvas} />;
  }
}

CrossSection.propTypes = {
  message: PropTypes.string
};

export default CrossSection;
