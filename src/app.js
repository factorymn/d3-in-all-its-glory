import drawFunction from './stepThree';

drawFunction();

module.hot.accept('./stepThree', () => {
  const newDrawFunction = require('./stepThree').default;

  document.getElementsByClassName('legend')[0].innerHTML = '';
  document.getElementsByClassName('chart')[0].innerHTML = '';

  newDrawFunction();
});
