var window = window || {};

module.exports = 
  window.requestAnimationFrame ||
  window.webketRequestAnimationFrame ||
  window.mozRequestAnimationFrame || 
  window.oRequestAnimationFrame ||
  process.nextTick;
