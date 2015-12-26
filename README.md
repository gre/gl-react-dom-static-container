# gl-react-dom-static-container ![](https://img.shields.io/npm/v/gl-react-dom-static-container.svg) ![](https://img.shields.io/badge/gl--react--dom->= 2.0-05F561.svg)

**StaticContainer** for gl-react-dom:
render in WebGL once, snapshot in `<img>` and re-use contexts.

WebGL have limitation on maximum concurrent instance you can display at the same time,
this component allows to cache this rendering into an image.

## Props

- `children` **(required)**: the `<Surface>` (created with gl-react-dom)
- `shouldUpdate` *(bool)*: tell if the StaticContainer need to be re-rendered
- `maximumConcurrent` *(number)*: limit the maximum concurrent Surface instance that can run across all StaticContainer's.

## Usage Examples

```js
var GLStaticContainer = require("gl-react-dom-static-container");
// or
import GLStaticContainer from "gl-react-dom-static-container";

...

<GLStaticContainer>
  <Surface ...>
    ...
  </Surface>
</GLStaticContainer>
```
