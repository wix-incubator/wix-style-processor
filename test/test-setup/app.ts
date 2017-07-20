import './style.scss';
import * as fakeTpaResponse from './fake-tpa-response.json';
import * as fakeTpaChanged from './fake-tpa-change.json';

import styleProcessor from '../../src/index';
window.Wix.Utils.getViewMode = () => 'editor';

if (window.name !== 'E2E') {
    styleProcessor.init({});
}
window.styleProcessor = styleProcessor; // Used by E2E

window.postMessage(JSON.stringify(fakeTpaResponse), '*');

window.changeStyles = () => window.postMessage(JSON.stringify(fakeTpaChanged), '*');
