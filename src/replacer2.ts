const funcsRegexStr = '(' + ['color', 'opacity', 'darken', 'string', 'join', 'number', 'font', 'increment', 'incrementer', 'withoutOpacity'].join('|') + ')\\((.*)\\)';
const paramsRegex = /,(?![^(]*\))/g;
const funcsRegex = new RegExp(funcsRegexStr);
export function replacer2({
    declaration,
    colors,
    fonts,
    numbers,
    strings,
    vars
}, plugins) {
    let [key, value] = declaration.split(':');

    if (isSupportedFunction(value)) {
        var x = executeFunction(value);
        console.log(x);
    }
}

const plugins = {
    join: (...args) => 'join-parsed('+args.join('-evaled,')+')',
    opacity: (...args) => 'opacity-parsed('+args.join('-evaled,')+')'
};

function executeFunction(value) {
    console.log(value);
    let groups;
    if (groups = funcsRegex.exec(value)) {
        return plugins[groups[1]](...groups[2].split(paramsRegex).map(executeFunction));
    } else {
        return value;
    }
}

function isSupportedFunction(value) {
    return funcsRegex.test(value);
}
