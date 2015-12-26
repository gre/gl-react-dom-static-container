import invariant from "invariant";
import React from "react";
const {
  Component,
  PropTypes,
  Children
} = React;
import {Surface} from "gl-react-dom";

const pendings = [];
let nbRenderings = 0;

function add (list, item) {
  list.push(item);
}
function remove (list, item) {
  const i = list.indexOf(item);
  if (i !== -1) list.splice(i, 1);
}

class GLStaticContainer extends Component {
  constructor (props) {
    super(props);
    this.state = {
      frame: null,
      frameId: 1,
      framePendingLoad: false,
      shouldUpdate: false
    };
    this._pending = false;
    this._rendering = false;
  }

  addPending () {
    if (!this._pending) {
      add(pendings, this);
      this._pending = true;
    }
  }
  removePending () {
    if (this._pending) {
      remove(pendings, this);
      this._pending = false;
    }
  }
  isPending () {
    return this._pending;
  }

  addRendering () {
    if (!this._rendering) {
      nbRenderings ++;
      this._rendering = true;
    }
  }
  removeRendering () {
    if (this._rendering) {
      nbRenderings --;
      this._rendering = false;
    }
  }
  isRendering () {
    return this._rendering;
  }

  componentWillMount () {
    this.addPending();
    this.pendingCheckLoad();
  }

  componentWillUnmount () {
    this.removePending();
    this.removeRendering();
    if (this._timeout) clearTimeout(this._timeout);
    if (this._shouldUpdateTimeout) clearTimeout(this._shouldUpdateTimeout);
  }

  componentWillReceiveProps ({ shouldUpdate }) {
    this.syncShouldUpdate(!!shouldUpdate);
  }

  componentWillUpdate (props, { shouldUpdate }) {
    if (!this.isRendering()) {
      if (shouldUpdate)
        this.addPending();
      this.pendingCheckLoad();
    }
    this.renderingCheckLoad();
  }

  shouldComponentUpdate () {
    return !this._frozen;
  }

  syncShouldUpdate (shouldUpdate) {
    const old = this.state.shouldUpdate;
    if (shouldUpdate !== old) {
      if (this._shouldUpdateTimeout) clearTimeout(this._shouldUpdateTimeout);
      if (shouldUpdate) this.setState({ shouldUpdate });
      else {
        setTimeout(() => this.setState({ shouldUpdate }), this.props.debounceShouldUpdate);
      }
    }
  }

  pendingCheckLoad = triggersReload => {
    if (this._frozen) return;
    if (nbRenderings < this.props.maximumConcurrent && this.isPending()) {
      this.removePending();
      this.addRendering();
      if (triggersReload) {
        this._frozen = true;
        this._timeout = setTimeout(() => {
          this._frozen = false;
          this.forceUpdate();
        }, this.props.timeout);
      }
    }
  }

  renderingCheckLoad = () => {
    if (this._loaded && this._surface && this.isRendering()) {
      if (!this.state.shouldUpdate) {
        if (!this.state.framePendingLoad) {
          this._frozen = true;
          this._surface.captureFrame().then(frame => {
            this._frozen = false;
            this.setState({
              frame,
              frameId: this.state.frameId + 1,
              framePendingLoad: true
            });
            pendings.forEach(p => p.pendingCheckLoad(true));
          });
        }
      }
      else {
        if (this.state.frame) {
          this.setState({ frame: null });
        }
      }
    }
  }

  onFrameLoad = () => {
    this.removeRendering();
    this.setState({ framePendingLoad: false });
  }

  render () {
    const { frame, frameId, framePendingLoad } = this.state;
    const { children, shouldUpdate, maximumConcurrent, style, ...rest } = this.props;
    const surface = Children.only(children);
    invariant(children && children.type === Surface,
      "GLStaticContainer `children` props must be a Surface. Got: %s",
      children && children.type);
    const { props: surfaceProps } = surface;
    const { width, height } = surfaceProps;

    const wrapperStyle = {
      position: "relative",
      ...style,
      width: width,
      height: height,
      overflow: "hidden"
    };

    let staticChildren = [];

    if (frame) {
      // Render the static content (captured frame)
      staticChildren.push(
        <img
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width,
            height
          }}
          src={frame}
          key={"img_"+frameId}
          onLoad={this.onFrameLoad}
        />
      );
    }

    if (framePendingLoad || this.isRendering()) {
      // Render the Surface and captureFrame() it
      staticChildren.push(React.cloneElement(surface, {
        ...surfaceProps,
        style: {
          ...(surfaceProps.style||{}),
          position: "absolute",
          top: 0,
          left: 0
        },
        key: "canvas",
        ref: surface => {
          this._surface = surface;
          if (surface) this.renderingCheckLoad();
        },
        onLoad: () => {
          if (surfaceProps.onLoad) surfaceProps.onLoad();
          this._loaded = true;
          this.renderingCheckLoad();
        }
      }));
    }

    return <div {...rest} style={wrapperStyle}>{staticChildren}</div>;
  }
}

GLStaticContainer.defaultProps = {
  shouldUpdate: false,
  maximumConcurrent: 3,
  timeout: 30,
  debounceShouldUpdate: 200
};

GLStaticContainer.propTypes = {
  shouldUpdate: PropTypes.bool,
  children: PropTypes.node.isRequired,
  maximumConcurrent: PropTypes.number,
  timeout: PropTypes.number,
  debounceShouldUpdate: PropTypes.number
};

module.exports = GLStaticContainer;
