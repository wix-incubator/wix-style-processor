const underlineFontHackRegex = /font\((--[^)]+)\)/;
export const defaultReplacers = {
    underlineFontHackSupport: (key, value) => {
        let matches;
        if (key === 'font' && (matches = value.match(underlineFontHackRegex))) {
            return {key, value: `${value};text-decoration: "underline(${matches[1]})"`};
        }

        return {key, value};
    }
};
