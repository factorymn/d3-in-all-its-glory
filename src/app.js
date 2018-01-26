import drawFunction from './stepFive';

drawFunction();

module.hot.accept('./stepFive', () => {
  const newDrawFunction = require('./stepFive').default;

  document.getElementsByClassName('legend')[0].innerHTML = '';
  document.getElementsByClassName('chart')[0].innerHTML = '';

  newDrawFunction();
});
