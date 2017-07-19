import {isCssVar, splitDeclaration} from './utils';
import {VarsResolver} from './varsResolver';

const paramsRegex = /,(?![^(]*(?:\)|}))/g;
const customSyntaxRegex = /"\w+\([^"]*\)"/g;

export function processor({
    declaration,
    vars
}, plugins) {
    let {key, value} = splitDeclaration(declaration);

    if (plugins.declarationReplacers.length > 0) {
        plugins.declarationReplacers.forEach(plugin => {
            let pluginResult = plugin(key, value);
            key = pluginResult.key;
            value = pluginResult.value;
        });
    }

    let newValue = value.replace(customSyntaxRegex, (part) => {
        if (plugins.isSupportedFunction(part)) {
            return executeFunction(part, plugins, vars);
        }
        return part;
    });

    return key + ': ' + newValue;
}

function executeFunction(value, plugins, vars: VarsResolver) {
    let functionSignature;

    if (functionSignature = plugins.getFunctionSignature(value)) {
        return plugins.cssFunctions[functionSignature.funcName](...functionSignature.args.split(paramsRegex)
            .map((v) => executeFunction(v, plugins, vars)))(vars.tpaParams);
    } else {
        return getVarOrPrimitiveValue(value, plugins, vars);
    }
}

function getVarOrPrimitiveValue(varName, plugins, vars) {
    if (isCssVar(varName)) {
        varName = vars.getValue(varName);
        if (plugins.isSupportedFunction(varName)) {
            varName = executeFunction(varName, plugins, vars);
        }
    }

    return varName;
}
