import drawFunction from './stepSix';

drawFunction();

module.hot.accept('./stepSix', () => {
  const newDrawFunction = require('./stepSix').default;

  document.getElementsByClassName('legend')[0].innerHTML = '';
  document.getElementsByClassName('chart')[0].innerHTML = '';

  newDrawFunction();
});
