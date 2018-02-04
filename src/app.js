import drawFunction from './stepSix';

drawFunction();

module.hot.accept('./stepSix', () => { // eslint-disable-line no-undef
  const newDrawFunction = require('./stepSix').default;

  document.getElementsByClassName('legend')[0].innerHTML = '';
  document.getElementsByClassName('chart')[0].innerHTML = '';
  document.getElementsByClassName('extra-options-container')[0].innerHTML = '';
  document.getElementsByClassName('preview')[0].innerHTML = '';

  newDrawFunction();
});
