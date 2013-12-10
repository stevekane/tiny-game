module.exports = function (window) {
  var vendors = ['ms', 'moz', 'webkit', 'o']
    , raf = window.requestAnimationFrame
    , caf = window.cancelAnimationFrame
    , i
    , j;

  for (i = 0; i < vendors.length && !raf; ++i) {
    raf = window[vendors[i]+"RequestAnimationFrame"];
    console.log(vendors[i]);
  }

  for (j = 0; j < vendors.length && !caf; ++j) {
    caf = window[vendors[i]+"CancelAnimationFrame"] 
       || window[vendors[i]+"CancelRequestAnimationFrame"];
  }

  return {
    requestAnimationFrame: raf,
    cancelAnimationFrame: caf
  };
};
