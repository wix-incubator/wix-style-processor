import {isCssVar} from './utils';

const customSyntaxRegex = /"\w+\([^"]*\)"/g;

export class CustomSyntaxHelper {
    private vars: {} = {};
    public customSyntaxStrs = [];

    public extractVar(key: string, value: string) {
        if (isCssVar(key)) {
            this.vars[key] = value;
        }
    }

    public extractCustomSyntax(key: string, value: string) {
        let match;
        if (match = value.match(customSyntaxRegex)) {
            this.customSyntaxStrs.push(...match);
        }
    }

    public getValue(varName: string) {
        return this.vars[varName];
    }
}
