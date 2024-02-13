/**
 * wait - Wait for a specified amount of time
 * @param {number} ms The time to wait in milliseconds
 * @returns {Promise<void>} A promise that resolves after the specified time
 */
module.exports = function wait(ms = 50) {
  return new Promise(resolve => setTimeout(resolve, ms));
};
