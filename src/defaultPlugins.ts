import * as Color from 'color';
import {wixStylesFontUtils} from './wixStylesFontUtils';
import {isJsonLike, parseJson} from './utils';

const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
const getNormalizedContrast = (color1, color2) => {
    let contrast = color1.contrast(color2);

    if (contrast < 1) {
        contrast = 1 / contrast;
    }

    return contrast;
}

export const defaultPlugins = {
    join: (color1, strength1, color2, strength2) => {

        color1 = new Color(color1);
        color2 = new Color(color2);

        //todo: use strength
        //let color1strength = args[1];
        //let color2strength = args[3];

        const r = ((color1.red() / 255 + color2.red() / 255) * 255);
        const g = ((color1.green() / 255 + color2.green() / 255) * 255);
        const b = ((color1.blue() / 255 + color2.blue() / 255) * 255);
        const a = ((color1.alpha() + color2.alpha()) / 2);

        return new Color({r, g, b}).alpha(a).rgb().string();
    },
    color: (colorValue, tpaParams: ITPAParams) => {
        if (tpaParams.colors[colorValue]) {
            return tpaParams.colors[colorValue];
        }
        try {
            if (hexColorRegex.test(colorValue)) {
                return colorValue;
            } else if (colorValue) {
                return new Color(colorValue).rgb().string();
            } else {
                return '';
            }
        } catch (e) {
            throw new Error(`Unparsable color ${colorValue}`);
        }
    },
    font: (font, tpaParams: ITPAParams) => {
        let fontValue;
        if (typeof font === 'object') {
            fontValue = font;
        } else if (isJsonLike(font)) {
            const {theme, ...overrides} = parseJson(font);
            fontValue = {
                style: '',
                variant: '',
                weight: '',
                stretch: '',
                size: '',
                lineHeight: '',
                family: [], ...tpaParams.fonts[theme], ...overrides
            };
        } else if (tpaParams.fonts[font]) {
            fontValue = tpaParams.fonts[font];
        } else {
            return font;
        }

        let fontCssValue = wixStylesFontUtils.toFontCssValue(fontValue);

        if (fontCssValue[fontCssValue.length - 1] === ';') {
            fontCssValue = fontCssValue.split(';')[0];
        } else {
            //todo: else never reached
        }

        return fontCssValue;

    },
    opacity: (color, opacity) => {
        return (new Color(color)).fade(1 - opacity).rgb().string();
    },
    withoutOpacity: (color) => {
        return (new Color(color)).alpha(1).rgb().string();
    },
    string: (value) => {
        return value;
    },
    darken: (colorVal, darkenValue) => {
        return (new Color(colorVal)).darken(darkenValue).rgb().string();
    },
    lighten: (colorVal, lightenValue) => {
        return (new Color(colorVal)).lighten(lightenValue).rgb().string();
    },
    number: (value) => {
        return +value;
    },
    underline: (font) => {
        return font && font.underline ? 'underline' : '';
    },
    unit: (value, unit) => {
        return `${value}${unit}`;
    },
    fallback: (...args) => {
        const argsWithoutTPAParams = args.slice(0, -1);
        return argsWithoutTPAParams.filter(Boolean)[0];
    },
    zeroAsTrue: (zero) => {
        return (typeof zero === 'number') ? `${zero}` : zero;
    },
    calculate: (operator, ...args) => {
        const numbersWithoutTPAParams = args.slice(0, -1);
        if (numbersWithoutTPAParams.length > 1) {
            return `calc(${numbersWithoutTPAParams.join(` ${operator} `)})`;
        } else {
            return numbersWithoutTPAParams[0];
        }
    },

    readableFallback: (baseColor: string, suggestedColor: string, fallbackColor: string) => {
        const contrast = getNormalizedContrast(new Color(baseColor), new Color(suggestedColor));
        return contrast < 4.5 ? fallbackColor : suggestedColor;
    },
    smartBGContrast: (foreground, background) => {
        const color = new Color(foreground);
        let contrastColor = new Color(background);
        const baseLuminosity = color.luminosity();
        const originalContrastLuminosity = contrastColor.luminosity();
        const ratio = baseLuminosity / originalContrastLuminosity;
        const direction = ratio < 1 ? 1 : -1;
        let contrast = getNormalizedContrast(color, contrastColor);
        const luminositySteps = [1, 5, 10, 20, 30, 40, 50, 60];

        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < luminositySteps.length; i++) {
            if (contrast < 4.5) {
                contrastColor = contrastColor.lightness(contrastColor.lightness() + (direction * luminositySteps[i]));
            } else {
                break;
            }
            contrast = getNormalizedContrast(color, contrastColor);
        }

        return contrastColor.rgb().string();
    }
};
