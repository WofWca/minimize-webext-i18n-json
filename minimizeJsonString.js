// @ts-check

const minimizeObject = require('./minimizeObject');

/**
 * @param {string} json
 * @returns {string}
 */
// export default function(json) {
module.exports = function(json) {
  const o = JSON.parse(json);
  minimizeObject(o);
  return JSON.stringify(o);
}
