export function extractVarsPlugin(declaration, accumulate) {
    let [key, value] = declaration.split(':');
    key = key.trim();
    if(isCssVar(key)) {
        accumulate[key] = value.trim();
    }
}

function isCssVar(key) {
    return key.indexOf('--') === 0;
}
