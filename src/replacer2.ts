const funcsRegexStr = '(' + ['color', 'opacity', 'darken', 'string', 'join', 'number', 'font', 'increment', 'incrementer', 'withoutOpacity'].join('|') + ')\\((.*)\\)';
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
    }
}

const plugins = {
    join: (...arfg) => 'join('+arfg.join(',')+')',
    opacity: (...args) => 'opacity'
};

function executeFunction(value) {
    console.log(value);
    let groups;
    if (groups = funcsRegex.exec(value)) {
        console.log(groups[2].split(','));
        return plugins[groups[1]](...groups[2].split(',').map(executeFunction));
    } else {
        console.log(value);
        return value; 
    }
}

function isSupportedFunction(value) {
    return funcsRegex.test(value);
}
