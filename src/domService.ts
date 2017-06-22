import {map, each} from 'lodash';

export default {
    extractStyles() {
        return map(
            document.querySelectorAll('style:not([wix-style]):not([data-computed])'),
            style => style.textContent.split('\n').join(' ')
        ).join(' ');
    },

    overrideStyles(css) {
        each(document.querySelectorAll('style[data-computed=true]'), item => item.parentNode.removeChild(item));
        const style = document.createElement("style");
        style.setAttribute('data-computed', 'true');
        style.appendChild(document.createTextNode(css));
        if (document.querySelector('style[wix-style]')) {
            (document.head || document.getElementsByTagName('head')[0]).insertBefore(style, document.querySelector('style[wix-style]'));
        } else {
            (document.head || document.getElementsByTagName('head')[0]).appendChild(style);
        }
    }
};
