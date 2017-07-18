export function extractVarsPlugin(declaration, accumulate, styleParams) {
    let [key, value] = declaration.split(':');
    key = key.trim();
    if(isCssVar(key)) {
        accumulate[key] = styleParams.colors[key.substring(2, key.length)].value || value.trim();
    }
}

function isCssVar(key) {
    return key.indexOf('--') === 0;
}
