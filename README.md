# wix-style-processor
##### An alternative Wix Styles TPA processor.
This package provides a parser / transformer that scans your inline CSS, and replaces its dynamic style declarations to the values defined by the user's website / template.


# Installation
```shell
$ npm i -S wix-style-processor
```

# Usage
##### CSS
```css
.my-selector {
    --my-font: "font(Body-M)";                                              /* define a custom variable with a default value */
    --my-font2: "font({theme: 'Body-M', size: '10px', lineHeight: '2em', weight: 'bold', style:'italic'})"     /* will use Body-M as base font and override the given attributes */
    --default-width: "number(42)";                                          /* define a numeric custom var */

    font: "font(--my-font)";                                                /* assign a dynamic font value from a custom var */
    width: calc(100% - "number(--default-width)");                          /* assign a dynamic numeric value from a custom var */
    color: "color(color-8)";                                                /* assign a color from the site's palette */
    background-color: "join(opacity(color-1, 0.5), opacity(color-8, 0.5))"; /* blends 2 colors */
    color: "opacity(color-8, 0.3)";                                         /* add opacity to a site palette color */
    color: "withoutOpacity(opacity(color-8, 0.3))";                         /* will remove the opacity of site palette color */
    color: "darken(color-8, 0.3)";                                          /* make a darken version of site palette color */
    font: "font(--my-font2)";                                               /* will use the overridden default unless it was defined in settings  */
    border-width: "unit(--var-from-settings, px)";                          /* will produce border-width: 42px */
    color: "fallback(color(--var-from-settings), color(color-8))";          /* will return the first none falsy value from left to right */
    width: "calculate(+, 2px, 4%, 3em)";                                    /* will return the native calc function for the given operator and numbers a work around for https://github.com/thysultan/stylis.js/issues/116 */
    background-color: "smartContrast(color(--base-color), color(--contrast-color))"; /* given a base color and a suggested contrast color, returns the given contrast color if it's A11Y compliant or a lightened/darkened color that will comply */
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

### 1. CSS Custom functions plugins
These plugins define functions that transform the value-side of the CSS declaration.

##### Usage

Plugin definition (JS):

```javascript
import styleProcessor from 'wix-style-processor';

styleProcessor.plugins.addCssFunction(
    'increment', //Plugin name
    (param1, param2 ,..., siteParams?) => parseInt(params[0]) + 1 //Transformation function
);

//"param1" is the first param that the custom function got in css
//"param2" is the second param that the custom function got in css
...
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

### 2. Declaration Replacer plugins
These plugins allow you to replace the entire key / value of the CSS declaration.
Since they're invoked upon each and every declaration, there's no need to name them.

##### Example

Plugin definition (JS):

```javascript
    import styleProcessor from 'wix-style-processor';

    styleProcessor.plugins.addDeclarationReplacer((key, value, siteParams) => ({
        key: 'ZzZ-' + key + '-ZzZ',
        value: '#-' + value + '-#'
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
    ZzZ-bar-ZzZ: #-4-#;
}
```

# [RTL/LTR plugin](https://github.com/wix/wsp-plugin-rtl)
It is a `DeclarationReplacer plugin` that allows you to change dynamically LTR/RTL replacements in your CSS, you can use this plugin.

# Enhanced Editor mode
This mode take leverage of native **css vars** to speed up the rendering of editor changes.

This feature will be enabled only on browsers that [supports it](http://caniuse.com/#search=css-variables) and in `Editor / Preview` mode.

#### Benchmarks
Without css-vars usage: (the first line is a timing of first render)

![without](https://user-images.githubusercontent.com/9304194/28443749-b8c20e3c-6dc0-11e7-9ab5-03db9704d734.png)

With css-vars usage: (the first line is a timing of first render)

![with](https://user-images.githubusercontent.com/9304194/28443748-b7a87496-6dc0-11e7-96e4-2367619d28dd.png)

Demo:
![6l3dkmbxgb](https://user-images.githubusercontent.com/9304194/28503201-9cd348ca-700a-11e7-8ae0-a1d56fcdfcc6.gif)

# Important
This module only parses inline CSS.
It won't process any wix style params from an external (linked) CSS file.
The recommended approach for CSS inlining is by automating it in your build step - e.g. by using Webpack's style-loader.
