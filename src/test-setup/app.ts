import * as style from './style.scss';
import * as fakeTpaResponse from './fake-tpa-response.json';

import styleProcessor from '../index';

if(window.name !== 'E2E') {
  styleProcessor.init({});
} else {
  window.styleProcessor = styleProcessor; // Used by E2E
}
window.postMessage(JSON.stringify(fakeTpaResponse), '*');
