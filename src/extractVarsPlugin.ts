export function extractVarsPlugin(declaration, accumulate, parsedStyleParams) {
    let [key, value] = declaration.split(':');
    key = key.trim();

    if (isCssVar(key)) {
        let varNameInSettings = key.substring(2, key.length);
        if (parsedStyleParams.strings[varNameInSettings] && parsedStyleParams.strings[varNameInSettings].value) {
            accumulate[key] = parsedStyleParams.strings[varNameInSettings].value;
        } else if (parsedStyleParams.colors[varNameInSettings]) {
            accumulate[key] =  parsedStyleParams.colors[varNameInSettings];
        } else {
            accumulate[key] =  value.trim();
        }
    }
}

function isCssVar(key) {
    return key.indexOf('--') === 0;
}
