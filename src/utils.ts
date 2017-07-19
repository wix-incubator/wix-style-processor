export function isCssVar(key: string) {
    return key.indexOf('--') === 0;
}

export function splitDeclaration(decl: string): {key: string, value: string} {
    let [key, ...value] = decl.split(':');
    return {
        key: key.trim(),
        value: value.join(':').trim()
    }
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
