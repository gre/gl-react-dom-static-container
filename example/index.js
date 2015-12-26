import _tmp_ from "gl-react/react";
import React from "react";
import {render} from "react-dom";
import GLStaticContainer from "gl-react-dom-static-container";
import {Surface} from "gl-react-dom";
import Heart from "./Heart";

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
    flex: 1,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  }
};

class App extends React.Component {
  render () {
    const width = 64, height = 64;
    return <div style={styles.app}>
      {genNorm(16).map(row => <div key={row} style={styles.row}>
        {genNorm(16).map(col =>
          <GLStaticContainer key={col}>
            <Surface width={width} height={height}>
              <Heart
                color={[
                  1 - 0.5 * (Math.pow(row, 2) + Math.pow(col, 2)),
                  row,
                  col
                ]}
              />
            </Surface>
          </GLStaticContainer>
        )}
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
