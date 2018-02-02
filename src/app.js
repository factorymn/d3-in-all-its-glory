import drawFunction from './stepFive';

drawFunction();

module.hot.accept('./stepFive', () => { // eslint-disable-line no-undef
  const newDrawFunction = require('./stepFive').default;

  document.getElementsByClassName('legend')[0].innerHTML = '';
  document.getElementsByClassName('chart')[0].innerHTML = '';

  newDrawFunction();
});
