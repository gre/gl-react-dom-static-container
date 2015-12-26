# gl-react-dom-static-container ![](https://img.shields.io/npm/v/gl-react-dom-static-container.svg) ![](https://img.shields.io/badge/gl--react--dom->= 2.0-05F561.svg)

[Universal](https://projectseptemberinc.gitbooks.io/gl-react/content/docs/universal.html) gl-react **dom-static-container effect**

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
