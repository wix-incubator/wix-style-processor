const funcsRegexStr = '(' + ['color', 'opacity', 'darken', 'string', 'join', 'number', 'font', 'withoutOpacity'].join('|') + ')\\((.*)\\)';
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

export function isJsonLike(value: string) {
    return value[0] === '{' && value.slice(-1) === '}';
}

export function parseJson(value: string): { theme: string, size?: string, lineHeight?: string, style?: string, weight: string } {
    return <any>value.slice(1, -1)
        .split(',')
        .reduce((json, current) => {
            const [key, value] = current.split(':');
            json[key.trim()] = value.trim().slice(1, -1);
            return json;
        }, {});
}
