import invariant from "invariant";
import React from "react";
const {
  Component,
  PropTypes,
  Children
} = React;
import {Surface} from "gl-react-dom";

const pendings = [];
const loadings = [];

function add (list, item) {
  list.push(item);
}
function remove (list, item) {
  const i = list.indexOf(item);
  if (i !== -1) list.splice(i, 1);
}
function contains (list, item) {
  return list.indexOf(item) !== -1;
}

class GLStaticContainer extends Component {
  constructor (props) {
    super(props);
    this.state = {
      frame: null
    };
  }
  componentWillMount () {
    add(pendings, this);
    this.pendingCheckLoad();
  }
  componentWillUnmount () {
    remove(pendings, this);
    remove(loadings, this);
  }
  componentWillUpdate ({ shouldUpdate }) {
    if (!contains(loadings, this)) {
      add(pendings, this);
      this.pendingCheckLoad();
    }
  }
  pendingCheckLoad = triggerReload => {
    if (contains(pendings, this) && loadings.length < this.props.maximumConcurrent) {
      remove(pendings, this);
      add(loadings, this);
      if (triggerReload) setTimeout(() => this.forceUpdate(), this.props.timeout);
    }
  }

  onLoadOrRef = () => {
    if (this._loaded && this._surface) {
      remove(loadings, this);
      pendings.forEach(p => p.pendingCheckLoad(true));
      this._surface.captureFrame().then(frame =>
        this.setState({ frame }));
    }
  }
  render () {
    const { frame } = this.state;
    const { children, shouldUpdate, maximumConcurrent } = this.props;
    const surface = Children.only(children);
    invariant(children.type === Surface,
      "GLStaticContainer `children` props must be a Surface. Got: %s",
      children.type);
    const { props } = surface;
    const { style, width, height } = props;

    const wrapperStyle = {
      position: "relative",
      ...style,
      width: width,
      height: height,
      overflow: "hidden"
    };

    let child;

    if (frame && !shouldUpdate) {
      // Render the static content (captured frame)
      child = <img style={{ width, height }} src={frame} />;
    }
    else if (contains(loadings, this)) {
      // Render the Surface and captureFrame() it
      child = React.cloneElement(surface, {
        ...props,
        ref: surface => {
          this._surface = surface;
          this.onLoadOrRef();
        },
        onLoad: () => {
          if (props.onLoad) props.onLoad();
          this._loaded = true;
          this.onLoadOrRef();
        }
      });
    }
    else {
      // Waiting pending StaticContainer to finish
      child = <div style={wrapperStyle} />;
    }

    return <div style={wrapperStyle}>{child}</div>;
  }
}

GLStaticContainer.defaultProps = {
  shouldUpdate: false,
  maximumConcurrent: 3,
  timeout: 30
};

GLStaticContainer.propTypes = {
  shouldUpdate: PropTypes.bool,
  children: PropTypes.node.isRequired,
  maximumConcurrent: PropTypes.number
};

module.exports = GLStaticContainer;
