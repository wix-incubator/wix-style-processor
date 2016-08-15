import $ from 'jquery';
import _ from 'lodash';

export default {
    extractStyles() {
        const css = _.map($('style'),
                          style => $(style).text().split('\n').join(' ')).join(' ');

        return css;
    },

    overrideStyles(css) {
        $('style[data-computed=true]').remove();
        $('<style data-computed=\'true\'>').text(css).appendTo(($('head')));
    }
};
