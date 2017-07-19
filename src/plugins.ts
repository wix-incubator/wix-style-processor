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

    public getFunctionSignature(str: string) {
        let groups = this.regex.exec(str);
        if (groups) {
            return {
                funcName: groups[1],
                args: groups[2]
            }
        }

        return null;
    }

    private updateRegex() {
        this.regex = new RegExp('(' + Object.keys(this.cssFunctions).join('|') + ')\\((.*)\\)');
    }
}

function wrapWithValueProvider(fn: Function) {
    return (...args) => (tpaParams: ITPAParams) => fn(...args, tpaParams);
}
