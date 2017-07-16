import * as style from './style.scss';
import * as fakeTpaResponse from './fake-tpa-response.json';
import * as fakeTpaChanged from './fake-tpa-change.json';

import styleProcessor from '../index';

console.log(style);

if(window.name !== 'E2E') {
  styleProcessor.init({});
} else {
  window.styleProcessor = styleProcessor; // Used by E2E
}
window.postMessage(JSON.stringify(fakeTpaResponse), '*');

if (window.name === 'E2E') {
  window.changeStyles = () => window.postMessage(JSON.stringify(fakeTpaChanged), '*');
}
