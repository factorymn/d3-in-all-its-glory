import drawFunction from './stepOne';

drawFunction();

module.hot.accept('./stepOne', () => { // eslint-disable-line no-undef
  const newDrawFunction = require('./stepOne').default;

  document.getElementsByClassName('legend')[0].innerHTML = '';
  document.getElementsByClassName('chart')[0].innerHTML = '';

  newDrawFunction();
});
