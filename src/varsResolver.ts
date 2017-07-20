import {isCssVar, splitDeclaration} from './utils';

export class VarsResolver {
    private vars: {} = {};

    public extractVar(declaration: string) {
        let {key, value} = splitDeclaration(declaration);

        if (isCssVar(key)) {
            this.vars[key] = value;
        }
    }

    public getValue(varName:string) {
        return this.vars[varName];
    }
}
