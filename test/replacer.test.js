import {expect} from 'chai';
import Wss from '../src/replacer.js';

describe('replacer', () => {

    it('Parses and fills old WSS color data ("_@colors[XXXX] || YYYY")', () => {
        const wss = new Wss({css:'.hello { color: "_@colors[wixorders.orderingcheckoutpopupbackground] || get(color-2)"; }'});
        expect(wss.defaults.colors).to.deep.equal({'wixorders.orderingcheckoutpopupbackground':'get(color-2)'});

        const result = wss.get({colors:{'wixorders.orderingcheckoutpopupbackground':'#777777'}});
        expect(result).to.equal('.hello { color: #777777; }');
    });

    it('Parses and fills new WSS color data ("-wss-color")', () => {
        const wss = new Wss({css:'.hello { -wss:Test; -wss-color: color-8; }'});

        // Test default
        const result = wss.get({colors:{'color-8':'#222222'}});
        expect(result).to.equal('.hello { color: #222222; }');

        // Test specific
        const result2 = wss.get({colors:{'color-8':'#222222', 'Test.color':'#333333'}});
        expect(result2).to.equal('.hello { color: #333333; }');
    });

    it('Parses and fills old WSS font data ("_@fonts[XXXX] || YYYY")', () => {
        const fonts = {
            'base': {style:'s1', variant:'v1', weight:'w1', size:'1em', lineHeight:'2em', family:['basefamily']},
            'wixorders.orderingcheckoutpopupbackground': {style:'ssss', variant:'vvvv', weight:'bolder', size:'12em', lineHeight:'24em', family:['family1', 'family2', 'base']}
        }

        // Old style tokens
        const wss = new Wss({css:'.hello { font: "_@fonts[wixorders.orderingcheckoutpopupbackground] || preset(Body-L)"; }'});
        expect(wss.defaults.fonts).to.deep.equal({'wixorders.orderingcheckoutpopupbackground':'preset(Body-L)'});
        const result = wss.get({fonts});
        expect(result).to.equal('.hello { font: ssss vvvv bolder 12em/24em family1,family2,basefamily; }');

        // New style tokens
        const wss2 = new Wss({css:'.hello { font: "_@fonts[wixorders.orderingcheckoutpopupbackground] || preset(Body-L)"; }'});
        const result2 = wss2.get({fonts});
        expect(result2).to.equal('.hello { font: ssss vvvv bolder 12em/24em family1,family2,basefamily; }');
    });

    it('Parses and fills new WSS font data ("-wss-font")', () => {
        const fonts = {
            'base': {style:'s1', variant:'v1', weight:'w1', size:'1em', lineHeight:'2em', family:['basefamily']},
            'wixorders.orderingcheckoutpopupbackground': {style:'ssss', variant:'vvvv', weight:'bolder', size:'12em', lineHeight:'24em', family:['family1', 'family2', 'base']}
        }

        const wss = new Wss({css:'.hello { -wss:Test; -wss-font: light 2em/9em wixorders.orderingcheckoutpopupbackground; }'});
        const result = wss.get({fonts});
        expect(result).to.equal('.hello { font: normal light normal 2em/9em family1,family2,basefamily; }');
    });

    it('Parses and fills START, END, STARTSIGN, ENDSIGN, DIR', () => {
        const wss = new Wss({css:'.hello { START:2px; END:5px; top:STARTSIGN5px; bottom:ENDSIGN5px; direction:DIR; }'});

        const result = wss.get({isRtl:false});
        expect(result).to.equal('.hello { left:2px; right:5px; top:-5px; bottom:5px; direction:ltr; }');

        const result2 = wss.get({isRtl:true});
        expect(result2).to.equal('.hello { right:2px; left:5px; top:5px; bottom:-5px; direction:rtl; }');
    });

    it('Parses css var type declarations for defaults and values', () => {
        const fonts = {
            'Body-L': {style:'s1', variant:'v1', weight:'w1', size:'1em', lineHeight:'2em', family:['basefamily']},
            'base': {style:'s1', variant:'v1', weight:'w1', size:'1em', lineHeight:'2em', family:['basefamily']},
            'aaa.333': {style:'ssss', variant:'vvvv', weight:'bolder', size:'12em', lineHeight:'24em', family:['family1', 'family2', 'family3']}
        }

        const wss = new Wss({css:'.hello { --color-bbb: "get(color-2)"; --font-aaa.333: "preset(Body-L)"; color:"var(color-bbb)"; font:"var(font-aaa.333)"; background-color:"opacity(color-bbb, 0.5)"; font:"preset(Body-L)"; margin-top:"var(number-ccc)";}'});
        expect(wss.defaults.colors).to.deep.equal({'bbb':'get(color-2)'});
        expect(wss.defaults.fonts).to.deep.equal({'aaa.333':'preset(Body-L)'});

        const result = wss.get({colors:{'bbb':'#777777', 'color-2':'#111111'}, fonts, numbers:{'ccc':10}});
        expect(result).to.equal('.hello {   color:#777777; font:ssss vvvv bolder 12em/24em family1,family2,family3; background-color:rgba(119, 119, 119, 0.5); font:s1 v1 w1 1em/2em basefamily; margin-top:10;}');
    });
});
