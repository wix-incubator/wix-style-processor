import {isCssVar} from './utils';
import {CustomSyntaxHelper} from './customSyntaxHelper';
import {hash} from './hash';

const paramsRegex = /,(?![^(]*(?:\)|}))/g;

export function processor({
    part,
    customSyntaxHelper,
    tpaParams,
    cacheMap
}, {plugins, shouldUseCssVars}) {
    if (plugins.isSupportedFunction(part)) {
        const evaluationFunc = executeFunction(part, plugins, customSyntaxHelper);
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

function executeFunction(value, plugins, customSyntaxHelper: CustomSyntaxHelper) {
    let functionSignature;

    if (functionSignature = plugins.getFunctionSignature(value)) {
        return plugins.cssFunctions[functionSignature.funcName](...functionSignature.args.split(paramsRegex)
            .map((v) => executeFunction(v.trim(), plugins, customSyntaxHelper)));
    } else {
        return getVarOrPrimitiveValue(value, plugins, customSyntaxHelper);
    }
}

function getVarOrPrimitiveValue(varName, plugins, customSyntaxHelper) {
    if (isCssVar(varName)) {
        const varValue = customSyntaxHelper.getValue(varName);
        let defaultVarValue;
        if (plugins.isSupportedFunction(varValue)) {
            defaultVarValue = executeFunction(varValue, plugins, customSyntaxHelper);
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
