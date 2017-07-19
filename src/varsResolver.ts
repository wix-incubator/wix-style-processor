import {isCssVar, splitDeclaration} from './utils';

export class VarsResolver {
    private vars: {} = {};

    constructor(public tpaParams: ITPAParams) {

    }

    public extractVar(declaration: string) {
        let {key, value} = splitDeclaration(declaration);

        if (isCssVar(key)) {
            this.vars[key] = value;
        }
    }

    public getValue(varName:string) {
        let varValue = this.vars[varName];
        //no var declared, maybe is has value in style params (from settings)
        let varNameInSettings = varName.substring(2, varName.length);
        if (this.tpaParams.strings[varNameInSettings] && this.tpaParams.strings[varNameInSettings].value) {
            return this.tpaParams.strings[varNameInSettings].value;
        } else if (this.tpaParams.colors[varNameInSettings]) {
            return this.tpaParams.colors[varNameInSettings];
        } else if (this.tpaParams.fonts[varNameInSettings]) {
            return this.tpaParams.fonts[varNameInSettings];
        } else if (this.tpaParams.numbers[varNameInSettings]) {
            return this.tpaParams.numbers[varNameInSettings];
        }
        //not a var
        return varValue;
    }
}
