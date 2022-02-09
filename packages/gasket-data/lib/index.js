let content = (document.getElementById('GasketData') || {}).textContent;
if (content) {
  content = JSON.parse(content);
}

module.exports = content;
