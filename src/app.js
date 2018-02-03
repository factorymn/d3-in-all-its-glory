import drawFunction from './stepTwo';

drawFunction();

module.hot.accept('./stepTwo', () => { // eslint-disable-line no-undef
  const newDrawFunction = require('./stepTwo').default;

  document.getElementsByClassName('legend')[0].innerHTML = '';
  document.getElementsByClassName('chart')[0].innerHTML = '';
  document.getElementsByClassName('extra-options-container')[0].innerHTML = '';

  newDrawFunction();
});
