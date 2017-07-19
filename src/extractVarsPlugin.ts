import {isCssVar, splitDeclaration} from './utils';

export function extractVarsPlugin(declaration, accumulate) {
    let {key, value} = splitDeclaration(declaration);

    if (isCssVar(key)) {
        accumulate[key] = value;
    }
}
