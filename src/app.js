import drawFunction from './stepFour';

drawFunction();

module.hot.accept('./stepFour', () => { // eslint-disable-line no-undef
  const newDrawFunction = require('./stepFour').default;

  document.getElementsByClassName('legend')[0].innerHTML = '';
  document.getElementsByClassName('chart')[0].innerHTML = '';

  newDrawFunction();
});
