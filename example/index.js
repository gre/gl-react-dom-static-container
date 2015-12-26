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

const styles = {
  app: {
    width: "100%",
    minWidth: 64 * 16,
    minHeight: 64 * 16,
    display: "flex",
    flexDirection: "column"
  },
  row: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  }
};

class HeartCache extends React.Component {
  constructor (props) {
    super(props);
    this.state = { mouseOver: false };
  }
  onMouseEnter = () => this.setState({ mouseOver: true })
  onMouseLeave = () => this.setState({ mouseOver: false })
  render () {
    const { width, height, color } = this.props;
    const { mouseOver } = this.state;
    return <Motion defaultStyle={{ over: 0 }} style={{ over: spring(mouseOver ? 1 : 0, [80, 10]) }}>
    { ({ over }) => <GLStaticContainer
        style={{ transform: "translateX(0)" }}
        maximumConcurrent={6}
        timeout={100}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
        shouldUpdate={mouseOver || over !== 0}>
        <Surface width={width} height={height} opaque={false}>
          <Heart color={color} over={over} />
        </Surface>
      </GLStaticContainer>
    }</Motion>;
  }
}

class App extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      // toggle is just useful to test a bit how the lib behaves
      toggle: true
    };
  }
  componentDidMount () {
    /*setInterval(() => this.setState({
      toggle: !this.state.toggle
    }), 500);*/
  }
  render () {
    const { toggle } = this.state;
    const width = 64, height = 64;
    return <div style={styles.app}>
      {genNorm(16).filter(v => v===1 ? toggle : true).map(row => <div key={row} style={styles.row}>
        {genNorm(16).map(col =>
          <HeartCache key={col}
            width={width}
            height={height}
            color={[
              1 - 0.5 * (Math.pow(row, 2) + Math.pow(col, 2)),
              row,
              col
            ]}
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
