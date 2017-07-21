import {isCssVar, splitDeclaration} from './utils';
import {VarsResolver} from './varsResolver';
import {hash} from './hash';

const paramsRegex = /,(?![^(]*(?:\)|}))/g;
const customSyntaxRegex = /"\w+\([^"]*\)"/g;

export function processor({
    part,
    varsResolver,
    tpaParams,
    cacheMap
}, {plugins, shouldUseCssVars}) {
    if (plugins.isSupportedFunction(part)) {
        const evaluationFunc = executeFunction(part, plugins, varsResolver);
        if (shouldUseCssVars) {
            const partHash = `--${hash(part)}`;
            cacheMap[partHash] = evaluationFunc;
            return `var(${partHash})`;
        } else {
            return evaluationFunc(tpaParams);
        }
    }
    return part;
}

function executeFunction(value, plugins, varsResolver: VarsResolver) {
    let functionSignature;

    if (functionSignature = plugins.getFunctionSignature(value)) {
        return plugins.cssFunctions[functionSignature.funcName](...functionSignature.args.split(paramsRegex)
            .map((v) => executeFunction(v.trim(), plugins, varsResolver)));
    } else {
        return getVarOrPrimitiveValue(value, plugins, varsResolver);
    }
}

function getVarOrPrimitiveValue(varName, plugins, varsResolver) {
    if (isCssVar(varName)) {
        const varValue = varsResolver.getValue(varName);
        let defaultVarValue;
        if (plugins.isSupportedFunction(varValue)) {
            defaultVarValue = executeFunction(varValue, plugins, varsResolver);
        } else {
            defaultVarValue = () => varValue;
        }

        return getDefaultValueOrValueFromSettings(varName, defaultVarValue);
    }

    return () => varName;
}

function getDefaultValueOrValueFromSettings(varName, defaultVarValue) {
    return (tpaParams: ITPAParams) => {
        let varNameInSettings = varName.substring(2, varName.length);
        if (tpaParams.strings[varNameInSettings] && tpaParams.strings[varNameInSettings].value) {
            return tpaParams.strings[varNameInSettings].value;
        } else if (tpaParams.colors[varNameInSettings]) {
            return tpaParams.colors[varNameInSettings];
        } else if (tpaParams.fonts[varNameInSettings]) {
            return tpaParams.fonts[varNameInSettings];
        } else if (tpaParams.numbers[varNameInSettings]) {
            return tpaParams.numbers[varNameInSettings];
        }
        //not found in settings
        return defaultVarValue(tpaParams);
    };
}
