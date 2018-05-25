function isIE() {
    return /(MSIE|Trident)/i.test(navigator.userAgent);
}

export default {
    getAllStyleTags() {
        return document.querySelectorAll('style:not([wix-style])');
    },
    overrideStyle(tag, css) {
        tag.originalTemplate = tag.originalTemplate || tag.textContent;
        if (isIE()) {
            tag.innerHTML = css;
        } else {
            tag.textContent = css;
        }
    },
    isCssVarsSupported(): boolean {
        return !!(window.CSS && window.CSS.supports && window.CSS.supports('--fake-var', 0));
    },
    updateCssVars(varMap) {
        Object.keys(varMap).forEach((key) => {
            document.documentElement.style.setProperty(key, varMap[key]);
        });
    }
};
