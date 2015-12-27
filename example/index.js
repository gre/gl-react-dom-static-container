import _tmp_ from "gl-react/react";
import React from "react";
import {render} from "react-dom";
import GLStaticContainer from "gl-react-dom-static-container";
import {Surface} from "gl-react-dom";
import {Motion, spring} from "react-motion";
import Heart from "./Heart";

window.Perf = require("react-addons-perf");

const genNorm = n => {
  const t = [];
  for (let i = 0; i < n; i ++)
    t.push(i / (n-1));
  return t;
};

const colorForColRow = (col, row) =>
  [ 1 - 0.5 * (Math.pow(row, 2) + Math.pow(col, 2)), row, col ];

const imageForColRowIndexes = (i, j) =>
  `https://unsplash.it/128/128/?random=${i}_${j}`;

const styles = {
  app: {
    width: "100%",
    display: "flex",
    flexDirection: "column"
  },
  row: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 64 * 16
  }
};

class InteractiveHeart extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      mouseOver: false,
      toggle: false
    };
  }
  onMouseEnter = () => this.setState({ mouseOver: true })
  onMouseLeave = () => this.setState({ mouseOver: false })
  onClick = () => this.setState({ toggle: !this.state.toggle })
  render () {
    const { width, height, color, image } = this.props;
    const { mouseOver, toggle } = this.state;
    return <Motion
      defaultStyle={{ over: 0, toggle: toggle ? 1 : 0 }}
      style={{
        over: spring(mouseOver ? 1 : 0, [150, 15]),
        toggle: spring(toggle ? 1 : 0, [150, 15]) }}>
    { ({ over, toggle }) => <GLStaticContainer
        style={{ transform: "translateX(0)", cursor: "pointer" }}
        maximumConcurrent={12}
        timeout={50}
        debounceShouldUpdate={30}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
        onClick={this.onClick}
        shouldUpdate={mouseOver || over !== 0}>
        <Surface width={width} height={height} opaque={false} preload>
          <Heart
            color={color}
            over={over}
            toggle={toggle}
            image={image}
          />
        </Surface>
      </GLStaticContainer>
    }</Motion>;
  }
}

class App extends React.Component {
  render () {
    const width = 96, height = 96;
    return <div style={styles.app}>{ genNorm(8).map((row, i) =>
      <div key={row} style={styles.row}>{ genNorm(10).map((col, j) =>
        <InteractiveHeart
          key={col}
          width={width}
          height={height}
          color={colorForColRow(col, row)}
          image={imageForColRowIndexes(i, j)}
        />)}
      </div>)}
    </div>;
  }
}

const container = document.createElement("div");
document.body.appendChild(container);
render(<App />, container);

document.body.style.padding = 0;
document.body.style.margin = 0;
document.documentElement.style.height =
document.body.style.height =
container.style.height = "100%";
