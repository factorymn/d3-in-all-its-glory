import drawFunction from './stepThree';

drawFunction();

module.hot.accept('./stepThree', () => { // eslint-disable-line no-undef
  const newDrawFunction = require('./stepThree').default;

  document.getElementsByClassName('legend')[0].innerHTML = '';
  document.getElementsByClassName('chart')[0].innerHTML = '';
  document.getElementsByClassName('extra-options-container')[0].innerHTML = '';

  newDrawFunction();
});
