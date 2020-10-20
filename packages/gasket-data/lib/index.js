const deepFreeze = require('deep-freeze');

let content = (document.getElementById('GasketData') || {}).textContent;
if (content) {
  content = deepFreeze(JSON.parse(content));
}

module.exports = content;
