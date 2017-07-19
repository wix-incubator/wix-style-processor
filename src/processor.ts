import {isCssVar, splitDeclaration} from './utils';

const paramsRegex = /,(?![^(]*(?:\)|}))/g;
const customSyntaxRegex = /"\w+\([^"]*\)"/g;

let values;

export function processor({
    declaration,
    colors,
    fonts,
    numbers,
    strings,
    vars
}, plugins) {
    let {key, value} = splitDeclaration(declaration);

    values = {colors, fonts, numbers, strings, vars};

    if (plugins.declarationReplacers.length > 0) {
        plugins.declarationReplacers.forEach(plugin => {
            let pluginResult = plugin(key, value);
            key = pluginResult.key;
            value = pluginResult.value;
        });
    }

    let newValue = value.replace(customSyntaxRegex, (part) => {
        if (plugins.isSupportedFunction(part)) {
            return executeFunction(part, plugins);
        }
        return part;
    });

    return key + ': ' + newValue;
}

function executeFunction(value, plugins) {
    let functionSignature;

    if (functionSignature = plugins.getFunctionSignature(value)) {
        return plugins.cssFunctions[functionSignature.funcName](...functionSignature.args.split(paramsRegex).map((v) => executeFunction(v, plugins)))(values);
    } else {
        return getVarOrPrimitiveValue(value, plugins);
    }
}

function getVarOrPrimitiveValue(value, plugins) {
    if (isCssVar(value)) {
        value = getVarValueFromSettingsOrDefault(value);
        if (plugins.isSupportedFunction(value)) {
            value = executeFunction(value, plugins);
        }
    }

    return value;
}

function getVarValueFromSettingsOrDefault(varName) {
    let varValue = values.vars[varName];
    //no var declared, maybe is has value in style params (from settings)
    let varNameInSettings = varName.substring(2, varName.length);
    if (values.strings[varNameInSettings] && values.strings[varNameInSettings].value) {
        return values.strings[varNameInSettings].value;
    } else if (values.colors[varNameInSettings]) {
        return values.colors[varNameInSettings];
    } else if (values.fonts[varNameInSettings]) {
        return values.fonts[varNameInSettings];
    } else if (values.numbers[varNameInSettings]) {
        return values.numbers[varNameInSettings];
    }
    //not a var
    return varValue;
}
