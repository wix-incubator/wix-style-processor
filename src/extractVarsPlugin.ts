import {isCssVar} from './utils';
export function extractVarsPlugin(declaration, accumulate) {
    let [key, value] = declaration.split(':');
    key = key.trim();

    if (isCssVar(key)) {
        accumulate[key] = value.trim();
    }
}
