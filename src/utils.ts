const funcsRegexStr = '(' + ['color', 'opacity', 'darken', 'string', 'join', 'number', 'font', 'increment', 'incrementer', 'withoutOpacity'].join('|') + ')\\((.*)\\)';
const funcsRegex = new RegExp(funcsRegexStr);

export function isSupportedFunction(value: any) {
    return funcsRegex.test(value);
}

export function getFunctionSignature(str: string) {
    let groups = funcsRegex.exec(str);
    if (groups) {
        return {
            funcName: groups[1],
            args: groups[2]
        }
    }

    return null;
}

export function isCssVar(key: string) {
    return key.indexOf('--') === 0;
}

export function concatKeyValue(keyValue: { key: string, value: string }) {
    return keyValue.key + ':' + keyValue.value;
}
