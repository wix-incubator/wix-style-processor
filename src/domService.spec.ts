import 'jsdom-global/register';
import {expect} from 'chai';
import * as sinon from 'sinon';

describe('DomService', () => {
    let domService,
        regularStyle;

    beforeEach(() => {
        const wixStyle = document.createElement('style');
        wixStyle.setAttribute('wix-style', 'true');
        wixStyle.textContent = 'body{color:red}';
        regularStyle = document.createElement('style');
        regularStyle.textContent = 'body{font: "font(Body-M)"}';
        document.head.appendChild(wixStyle);
        document.head.appendChild(regularStyle);
        domService = require('./domService').default;
    });

    it('should get all none wix style tags', () => {
        expect(domService.getAllStyleTags()).to.have.length(1);
    });

    it('should detect if css vars are supported', () => {
        expect(domService.isCssVarsSupported()).to.equals(false);
        window.CSS = {
            supports: () => true
        };
        expect(domService.isCssVarsSupported()).to.equals(true);
    });

    describe('overrideStyle', () => {
        it('should save on original template', () => {
            const content = regularStyle.textContent;
            domService.overrideStyle(regularStyle, 'html{line-height: 10px}');
            expect(regularStyle.originalTemplate).to.equals(content);
        });

        it('should use originalTemplate if exists', () => {
            const originalTemplate = 'original-template';
            regularStyle.originalTemplate = originalTemplate;
            domService.overrideStyle(regularStyle, 'html{line-height: 10px}');
            expect(regularStyle.originalTemplate).to.equals(originalTemplate);
        });

        it('should use textContent by default', () => {
            const spy = sinon.spy();
            const orgTextContent = regularStyle.textContent;

            Object.defineProperty(regularStyle, 'textContent', {
                get: () => orgTextContent,
                set: spy
            });

            domService.overrideStyle(regularStyle, 'html{line-height: 10px}');

            expect(spy.called).to.equals(true);
        });

        it('should use innerHTML in IE 11', () => {
            const spy = sinon.spy();
            const orgTextContent = regularStyle.textContent;
            global['window'] = {navigator: {userAgent: 'Trident'}};

            Object.defineProperty(regularStyle, 'textContent', {
                get: () => orgTextContent,
                set: spy
            });

            domService.overrideStyle(regularStyle, 'html{line-height: 10px}');

            expect(spy.called).to.equals(true);
        });
    });
});
