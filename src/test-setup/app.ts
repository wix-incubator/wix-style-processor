import * as style from './style.scss';
import * as fakeTpaResponse from './fake-tpa-response.json';

import styleProcessor from '../index';

styleProcessor.init({});
console.log(style);
window.postMessage(JSON.stringify(fakeTpaResponse), '*');
