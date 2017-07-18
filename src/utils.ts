const funcsRegexStr = '(' + ['color', 'opacity', 'darken', 'string', 'join', 'number', 'font', 'increment', 'incrementer', 'withoutOpacity'].join('|') + ')\\((.*)\\)';
const funcsRegex = new RegExp(funcsRegexStr);

export function isSupportedFunction(value) {
    return funcsRegex.test(value);
}

export function getFunctionSignature(str) {
    let groups = funcsRegex.exec(str);
    if (groups) {
        return {
            funcName: groups[1],
            args: groups[2]
        }
    }

    return null;
}

export function isCssVar(key) {
    return key.indexOf('--') === 0;
}
