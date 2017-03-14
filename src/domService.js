import _ from 'lodash';

export default {
    extractStyles() {
        return _.map(
            document.getElementsByTagName('style').filter(styleElement => styleElement.attributes[0] !== 'wix-style'),
            style => style.textContent.split('\n').join(' ')
        ).join(' ');
    },

    overrideStyles(css) {
        debugger;
        _.each(document.querySelectorAll('style[data-computed=true]'), item => item.parentNode.removeChild(item));
        const style = document.createElement("style");
        style.setAttribute('data-computed', 'true');
        style.appendChild(document.createTextNode(css));
        (document.head || document.getElementsByTagName('head')[0]).appendChild(style);
    }
};
