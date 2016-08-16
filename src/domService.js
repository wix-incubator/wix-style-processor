import $ from 'jquery';
import _ from 'lodash';

export default {
    extractStyles() {
        return _.map($('style'),
            style => $(style).text().split('\n').join(' ')).join(' ');
    },

    overrideStyles(css) {
        $('style[data-computed=true]').remove();
        $('<style data-computed=\'true\'>').text(css).appendTo(($('head')));
    }
};
