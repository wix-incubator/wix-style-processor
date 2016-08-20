# wix-style-processor
##### An alternative Wix Styles TPA processor.
This package provides a parser / transformer that scans your inlined CSS, and replaces its dynamic style declarations to the values defined by the user's website / template.


# Installation
```shell
$ npm i -S wix-style-processor
```

# Usage
##### CSS
```css
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

```javascript
import styleProcessor from 'wix-style-processor';

$(document).ready(() => {
    styleProcessor.init().then(() => {
        //start rendering your application here, or otherwise your app will flicker
    })
});
```

# Plugin support
You can customize and extend the module's behavior with the use of plugins.
Plugins are invoked during the processing phase of the CSS declarations, and they let you override the built-in transformations (such as opacity or join), or add transformations of your own.

There are 2 kinds of plugins, which will be detailed below.

### 1. Value transformation plugins
These plugins define functions that transform the value-side of the CSS declaration.

##### Usage

Plugin definition (JS):

```javascript
import styleProcessor from 'wix-style-processor';

styleProcessor.valuePlugin(
    'increment', //Plugin name
    (params, siteParams) => parseInt(params[0]) + 1 //Transformation function
);

//"params" is an array of the transformation's evaluated params
//"siteParams" is an object containing the user or template defined colors, fonts and numbers.
```

CSS definition:

```css
.foo {
    --baz: 1;
    bar: "increment(number(--baz))"px;
}
```

The CSS above will be replaced to:

```css
.foo {
    --baz: 1;
    bar: 2px;
}
```

#### Declaration transformation plugins
These plugins allow you to transform the entire key / value of the CSS declaration.
Since they're invoked upon each and every declaration, there's no need to name them.

##### Example

Plugin definition (JS):

```javascript
    import styleProcessor from 'wix-style-processor';

    styleProcessor.declarationPlugin((key, value, siteParams) => ({
        key: 'ZzZ' + key + 'ZzZ',
        value: '#' + value + '#'
    }));

    //key is a string containing the declaration's attribute
    //value is a string containing the attribute's value
```

CSS definition:

```css
.foo {
    bar: 4;
}
```

The CSS above will be replaced to:

```css
.foo {
    ZzZbarZzZ: #4#;
}
```

### Important
This module only parses inline CSS.
It won't process any wix style params from an external (linked) CSS file.
The recommended approach for CSS inlining is by automating it in your build step - e.g. by using Webpack's style-loader.
