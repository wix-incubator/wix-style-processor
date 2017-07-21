import {isCssVar, splitDeclaration} from './utils';

const customSyntaxRegex = /"\w+\([^"]*\)"/g;

export class VarsResolver {
    private vars: {} = {};
    public parts = [];

    public extractVar(declaration: string) {
        let {key, value} = splitDeclaration(declaration);

        if (isCssVar(key)) {
            this.vars[key] = value;
        }
    }

    public extractParts(declaration: string, plugins) {
        let {key, value} = splitDeclaration(declaration);

        if (plugins.declarationReplacers.length > 0) {
            plugins.declarationReplacers.forEach(plugin => {
                let pluginResult = plugin(key, value);
                key = pluginResult.key;
                value = pluginResult.value;
            });
        }

        let match;
        if (match = value.match(customSyntaxRegex)) {
            this.parts.push(...match);
        }

        return `${key}: ${value}`;
    }

    public getValue(varName: string) {
        return this.vars[varName];
    }
}
