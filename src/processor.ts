import {isCssVar, splitDeclaration} from './utils';
import {VarsResolver} from './varsResolver';
import {hash} from './hash';

const paramsRegex = /,(?![^(]*(?:\)|}))/g;
const customSyntaxRegex = /"\w+\([^"]*\)"/g;

export function processor({
    declaration,
    vars,
    cacheMap
}, {plugins, isCssVarsSupported}) {
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
            return isCssVarsSupported ? generateCssVar(part) : executeFunction(part, plugins, vars)(vars.tpaParams);
        }
        return part;
    });

    return key + ': ' + newValue;
}

function executeFunction(value, plugins, vars: VarsResolver) {
    let functionSignature;

    if (functionSignature = plugins.getFunctionSignature(value)) {
        const evaluationFunc = plugins.cssFunctions[functionSignature.funcName](...functionSignature.args.split(paramsRegex)
            .map((v) => executeFunction(v.trim(), plugins, vars)(vars.tpaParams)));

        return evaluationFunc;
    } else {
        return getVarOrPrimitiveValue(value, plugins, vars);
    }
}

function getVarOrPrimitiveValue(varName, plugins, vars) {
    if (isCssVar(varName)) {
        varName = vars.getValue(varName);
        if (plugins.isSupportedFunction(varName)) {
            return executeFunction(varName, plugins, vars);
        }
    }

    return () => varName;
}

function generateCssVar(part) {
    return `var(--${hash(part)})`;
}
