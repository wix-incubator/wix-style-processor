import {expect} from 'chai';
import Replacer from '../src/replacer.js';

describe('replacer', () => {
    let replacer;

    function getReplacer(css) {
        css = css.split('\n').map(t => t.trim()).join(' ');
        return new Replacer({css});
    }

    it('Parses and fills START, END, STARTSIGN, ENDSIGN, DIR', () => {
        const replacer = getReplacer('.hello { START:2px; END:5px; top:STARTSIGN5px; bottom:ENDSIGN5px; direction:DIR; }');

        const result = replacer.get({isRtl:false});
        expect(result).to.equal('.hello { left:2px; right:5px; top:-5px; bottom:5px; direction:ltr; }');

        const result2 = replacer.get({isRtl:true});
        expect(result2).to.equal('.hello { right:2px; left:5px; top:5px; bottom:-5px; direction:rtl; }');
    });

    it('should support assigning dynamic colors', () => {
        let css = `.foo {
              background-color: "get(color-1)";
              color: "var(color-1)";
              color: "opacity(color-1, 0.5)";
              color: "join(opacity(color-1, 1), opacity(color-1, 1))";
        }`;

        const replacer = getReplacer(css);

        let result = replacer.get({colors: {
            'color-1': '#FF0000'
        }});

        expect(result).to.equal('.foo { background-color: #FF0000; color: #FF0000; color: rgba(255, 0, 0, 0.5); color: rgb(255, 0, 0); }');
    });

    it('should support default values', () => {
        let css = `.foo {
            --color-bar: "get(color-1)";
        }
        .bar {
            color: "var(color-bar)";
        }`;

        const replacer = getReplacer(css);

        const result = replacer.get({
            colors: {
                'color-1': '#FF0000',
                'bar': '#777777'
            }
        });

        expect(result).to.equal('.foo {  } .bar { color: #777777; }');
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

    it('should support joining 2 colors', () => {
        //Given
        const replacer = new Replacer({css: 'background-color: "join(opacity(color-8, 1), opacity(#00FF00, 1))";'});

        //When
        const result = replacer.get({colors: {
            'color-8': '#FF0000'
        }});

        //Then
        expect(result).to.equal('background-color: rgb(255, 255, 0);');
    });
});
