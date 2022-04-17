// @ts-check

const minimizeObject = require('./minimizeObject');

/**
 * @param {string} json
 * @param {Parameters<typeof minimizeObject>[1]} [options]
 * @returns {string}
 */
// export default function(json) {
module.exports = function(json, options) {
  const o = JSON.parse(json);
  minimizeObject(o, options);
  return JSON.stringify(o);
}
