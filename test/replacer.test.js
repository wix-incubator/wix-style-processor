import {expect} from 'chai';
import Replacer from '../src/replacer.js';

describe('replacer', () => {

    it('Parses and fills old replacer color data ("_@colors[XXXX] || YYYY")', () => {
        const replacer = new Replacer({css:'.hello { color: "_@colors[wixorders.orderingcheckoutpopupbackground] || get(color-2)"; }'});
        expect(replacer.defaults.colors).to.deep.equal({'wixorders.orderingcheckoutpopupbackground':'get(color-2)'});

        const result = replacer.get({colors:{'wixorders.orderingcheckoutpopupbackground':'#777777'}});
        expect(result).to.equal('.hello { color: #777777; }');
    });

    it('Parses and fills old replacer font data ("_@fonts[XXXX] || YYYY")', () => {
        const fonts = {
            'base': {style:'s1', variant:'v1', weight:'w1', size:'1em', lineHeight:'2em', family:['basefamily']},
            'wixorders.orderingcheckoutpopupbackground': {style:'ssss', variant:'vvvv', weight:'bolder', size:'12em', lineHeight:'24em', family:['family1', 'family2', 'base']}
        }

        // Old style tokens
        const replacer = new Replacer({css:'.hello { font: "_@fonts[wixorders.orderingcheckoutpopupbackground] || preset(Body-L)"; }'});
        expect(replacer.defaults.fonts).to.deep.equal({'wixorders.orderingcheckoutpopupbackground':'preset(Body-L)'});
        const result = replacer.get({fonts});
        expect(result).to.equal('.hello { font: ssss vvvv bolder 12em/24em family1,family2,basefamily; }');

        // New style tokens
        const replacer2 = new Replacer({css:'.hello { font: "_@fonts[wixorders.orderingcheckoutpopupbackground] || preset(Body-L)"; }'});
        const result2 = replacer2.get({fonts});
        expect(result2).to.equal('.hello { font: ssss vvvv bolder 12em/24em family1,family2,basefamily; }');
    });

    it('Parses and fills START, END, STARTSIGN, ENDSIGN, DIR', () => {
        const replacer = new Replacer({css:'.hello { START:2px; END:5px; top:STARTSIGN5px; bottom:ENDSIGN5px; direction:DIR; }'});

        const result = replacer.get({isRtl:false});
        expect(result).to.equal('.hello { left:2px; right:5px; top:-5px; bottom:5px; direction:ltr; }');

        const result2 = replacer.get({isRtl:true});
        expect(result2).to.equal('.hello { right:2px; left:5px; top:5px; bottom:-5px; direction:rtl; }');
    });

    it('Parses css var type declarations for defaults and values', () => {
        const fonts = {
            'Body-L': {style:'s1', variant:'v1', weight:'w1', size:'1em', lineHeight:'2em', family:['basefamily']},
            'base': {style:'s1', variant:'v1', weight:'w1', size:'1em', lineHeight:'2em', family:['basefamily']},
            'aaa.333': {style:'ssss', variant:'vvvv', weight:'bolder', size:'12em', lineHeight:'24em', family:['family1', 'family2', 'family3']}
        }

        const replacer = new Replacer({css:'.hello { --color-bbb: "get(color-2)"; --font-aaa.333: "preset(Body-L)"; color:"var(color-bbb)"; font:"var(font-aaa.333)"; background-color:"opacity(color-bbb, 0.5)"; font:"preset(Body-L)"; margin-top:"var(number-ccc)";}'});
        expect(replacer.defaults.colors).to.deep.equal({'bbb':'get(color-2)'});
        expect(replacer.defaults.fonts).to.deep.equal({'aaa.333':'preset(Body-L)'});

        const result = replacer.get({colors:{'bbb':'#777777', 'color-2':'#111111'}, fonts, numbers:{'ccc':10}});
        expect(result).to.equal('.hello {   color:#777777; font:ssss vvvv bolder 12em/24em family1,family2,family3; background-color:rgba(119, 119, 119, 0.5); font:s1 v1 w1 1em/2em basefamily; margin-top:10;}');
    });
});
