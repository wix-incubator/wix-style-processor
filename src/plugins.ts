const paramsRegex = /,(?![^(]*(?:\)|}))/g;

export class Plugins {
    public cssFunctions: { [index: string]: Function };
    public declarationReplacers: Function[];

    private regex: RegExp;

    constructor() {
        this.resetPlugins();
    }

    public addCssFunction(funcName: string, func: Function) {
        this.cssFunctions[funcName] = wrapWithValueProvider(func);
        this.updateRegex();
    }

    public addDeclarationReplacer(func: Function) {
        this.declarationReplacers.push(func);
    }

    public resetPlugins() {
        this.cssFunctions = {};
        this.declarationReplacers = [];
        this.regex = undefined;
    }

    public isSupportedFunction(str: any) {
        return this.regex.test(str);
    }

    public getFunctionSignature(str: string): { funcName: string; args: string[] } {
        const groups = this.regex.exec(str);
        if (groups) {
            return {
                funcName: groups[1],
                args: this.extractParams(groups[2])
            };
        }

        return null;
    }

    private updateRegex() {
        this.regex = new RegExp(`(${Object.keys(this.cssFunctions).join('|')})\\((.*)\\)`);
    }

    private extractParams(params: string) {
        const result = [];
        const args = params.split(paramsRegex);
        args.reduce((acc, arg) => {
            if (this.isLegalExpression(acc + arg)) {
                result.push(acc ? `${acc},${arg}`: arg);
                return ''
            }
            return acc ? `${acc},${arg}`: arg;
        }, '');
        return result;
    }

    private isLegalExpression(expression: string) {
        return expression.split(/\(/g).length === expression.split(/\)/g).length;
    }
}

function wrapWithValueProvider(fnToWrap: Function) {
    return (...args) => (tpaParams: ITPAParams) => fnToWrap(...args.map(fn => fn(tpaParams)), tpaParams);
}
