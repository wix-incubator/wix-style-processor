# wix-style-processor
##### An alternative Wix Styles TPA processor.
This package provides a parser / transformer that scans your inlined CSS, and replaces its dynamic style declarations to the values defined by the user's website / template.

# Usage
##### CSS
```
.my-selector {
    --my-font: "font(Body-M)"; /* define a custom variable with a default value */
    --default-width: "number(42)"; /* define a numeric custom var */

    font: "font(--my-font)"; /* assign a dynamic font value from a custom var */
    width: "number(--default-width)"px; /* assign a dynamic numeric value from a custom var */
    color: "color(color-8)"; /* assign a color from the site's palette */
    background-color: "join(opacity(color-1, 0.5), opacity(color-8, 0.5))"; /* blends 2 colors */
    color: "opacity(color-8, 0.3)"; /* add opacity to a site palette color */
}
```

##### Module initialization

```
import styleProcessor from 'wix-style-processor';

$(document).ready(() => {
    styleProcessor.init().then(() => {
        //start rendering your application here - otherwise your app will flicker
    })
});
```
# Installation
```
npm i -S wix-style-processor
```

### Important
The parser only parses inline CSS.
It won't process any wix style params in an external (linked) CSS file.
The standard approach is to use Webpack's style-loader for inlining your CSS.
