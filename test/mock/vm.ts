import {Engine} from 'velocity';

export function renderVM(template, data) {
  const engine = new Engine({template});
  return engine.render({...data});
}
