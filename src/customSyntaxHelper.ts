import {isCssVar} from './utils';

const customSyntaxRegex = /"\w+\([^"]*\)"/g;

export class CustomSyntaxHelper {
    private readonly vars: {} = {};
    public customSyntaxStrs = [];

    public extractVar(key: string, value: string) {
        if (isCssVar(key)) {
            this.vars[key] = value;
        }
    }

    public extractCustomSyntax(key: string, value: string) {
        const match = value.match(customSyntaxRegex);
        if (match) {
            this.customSyntaxStrs.push(...match);
        }
    }

    public getValue(varName: string) {
        return this.vars[varName];
    }
}
