# gl-react-dom-static-container ![](https://img.shields.io/npm/v/gl-react-dom-static-container.svg) ![](https://img.shields.io/badge/gl--react--dom->= 2.0-05F561.svg)

**`<StaticContainer>`** for [gl-react-dom](https://github.com/ProjectSeptemberInc/gl-react-dom): caches WebGL rendering into an `<img>`, free and reuse WebGL contexts. The library schedules the WebGL renderings to limit the maximum concurrent number of running WebGL contexts in order to display a lot of WebGL renderings on the same page.

**without gl-react-dom-static-container:**

![2](https://cloud.githubusercontent.com/assets/211411/12009982/556bb112-ac92-11e5-93cb-748223c1955e.GIF)

> The maximum concurrent instance limit of WebGL can easily be reach if you try to use at least about 20 WebGL canvas running at the same time.

**with gl-react-dom-static-container:**

![1](https://cloud.githubusercontent.com/assets/211411/12009981/55574b1e-ac92-11e5-9bf8-d2e82d5b2104.GIF)

> `gl-react-dom-static-container` solves this problem by: **(1)** caching gl-react rendering into an image and **(2)** preventing a maximum concurrent gl-react-dom's Surface allowed to run at the same time.

## Props

- `children` **required** *(node)*: the `<Surface>` *created with `gl-react-dom`*.
- `maximumConcurrent` *(number)*: limit the maximum concurrent `<Surface>` instance that can run across all StaticContainer's.
- `shouldUpdate` *(bool)*: set to true to make the StaticContainer render the WebGL. If you keep the `shouldUpdate` value to true, the WebGL will continue to render the `<Surface>` (unless `maximumConcurrent` is reached). When `shouldUpdate` is set back to false, and after a `debounceShouldUpdate` duration, the Surface will be captured and cached in an image.
- `debounceShouldUpdate` *(number in ms)*: see `shouldUpdate` prop.
- `timeout` *(number in ms)*: set the time to wait before the first render happens.

## Usage

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

## Full Example

[![](https://cloud.githubusercontent.com/assets/211411/12011455/a2c9b0cc-accd-11e5-83f9-23c253bc7d88.gif)](http://greweb.me/gl-react-dom-static-container/example/)

**(see example/ folder)**
