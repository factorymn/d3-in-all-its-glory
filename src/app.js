import drawFunction from './stepTwo';

drawFunction();

module.hot.accept('./stepTwo', () => {
  const newDrawFunction = require('./stepTwo').default;

  document.getElementsByClassName('legend')[0].innerHTML = '';
  document.getElementsByClassName('chart')[0].innerHTML = '';

  newDrawFunction();
});
