import invariant from "invariant";
import React from "react";
const {
  Component,
  PropTypes,
  Children
} = React;
import {Surface, toBlobSupported} from "gl-react-dom";

const pendings = [];
let nbRenderings = 0;

class GLStaticContainer extends Component {
  constructor (props) {
    super(props);
    this.state = {
      frame: null,
      frameId: 1,
      framePendingLoad: false,
      shouldUpdate: false,
      renderingId: 1
    };
    this._pending = false;
    this._rendering = false;
  }

  addPending (init) {
    if (!this._pending) {
      if (init)
        pendings.push(this);
      else
        pendings.unshift(this);
      this._pending = true;
    }
  }
  removePending () {
    if (this._pending) {
      const i = pendings.indexOf(this);
      if (i !== -1) pendings.splice(i, 1);
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
    this.addPending(true);
    this.pendingCheckLoad();
  }

  componentWillUnmount () {
    this.removePending();
    this.removeRendering();
    if (this._timeout) clearTimeout(this._timeout);
    if (this._shouldUpdateTimeout) clearTimeout(this._shouldUpdateTimeout);
    if (this.state.frame && toBlobSupported) {
      URL.revokeObjectURL(this.state.frame);
    }
  }

  componentWillReceiveProps ({ shouldUpdate: propsShouldUpdate }) {
    const shouldUpdate = this.syncShouldUpdate(!!propsShouldUpdate);
    if (!this.isRendering()) {
      if (shouldUpdate)
        this.addPending();
      this.pendingCheckLoad();
    }
    this.renderingCheckLoad();
  }

  shouldComponentUpdate (nextProps, nextState) {
    const state = this.state;
    return !this._frozen && (
      nextProps.shouldUpdate ||
      nextState.frame !== state.frame ||
      nextState.frameId !== state.frameId ||
      nextState.framePendingLoad !== state.framePendingLoad ||
      nextState.renderingId !== state.renderingId ||
      nextState.shouldUpdate !== state.shouldUpdate
    );
  }

  syncShouldUpdate (shouldUpdate) {
    const old = this.state.shouldUpdate;
    if (shouldUpdate !== old) {
      const {debounceShouldUpdate} = this.props;
      if (this._shouldUpdateTimeout) {
        clearTimeout(this._shouldUpdateTimeout);
      }
      if (shouldUpdate || debounceShouldUpdate<=0) {
        this.setState({ shouldUpdate });
        return shouldUpdate;
      }
      else {
        this._shouldUpdateTimeout = setTimeout(
          () => this.setState({ shouldUpdate }),
          this.props.debounceShouldUpdate);
      }
    }
    return old;
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
          this.setState({ renderingId: this.state.renderingId + 1 });
        }, this.props.timeout);
      }
      else {
        this.setState({ renderingId: this.state.renderingId + 1 });
      }
    }
  };

  renderingCheckLoad = () => {
    if (this._frozen) return;
    if (this._loaded && this._surface && this.isRendering()) {
      if (!this.state.shouldUpdate) {
        if (!this.state.framePendingLoad) {
          this._frozen = true;
          this._surface
          .captureFrame({ format: toBlobSupported ? "blob" : "base64" })
          .then(toBlobSupported ?
            frameBlob => URL.createObjectURL(frameBlob) :
            frame => frame
          )
          .then(frame => {
            this._frozen = false;
            this.setState({
              frame,
              frameId: this.state.frameId + 1,
              framePendingLoad: true
            });
          });
        }
      }
      else {
        const {frame} = this.state;
        if (frame) {
          if (frame && toBlobSupported) {
            URL.revokeObjectURL(frame);
          }
          this.setState({ frame: null, frameBlob: null });
        }
      }
    }
  };

  onFrameLoad = () => {
    this.removeRendering();
    this.setState({ framePendingLoad: false });
    pendings.forEach(p => p.pendingCheckLoad(true));
  };

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
          if (surfaceProps.ref && typeof surfaceProps.ref === "function")
            surfaceProps.ref(surface);
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
  maximumConcurrent: 8,
  timeout: 30,
  debounceShouldUpdate: 100
};

GLStaticContainer.propTypes = {
  shouldUpdate: PropTypes.bool,
  children: PropTypes.node.isRequired,
  maximumConcurrent: PropTypes.number,
  timeout: PropTypes.number,
  debounceShouldUpdate: PropTypes.number
};

module.exports = GLStaticContainer;
