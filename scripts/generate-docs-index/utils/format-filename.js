/**
 * formatFilename - Format the filename to be more human readable
 * @param {string} filename The filename to format
 * @returns {string} The formatted filename
 */
module.exports = function formatFilename(filename) {
  filename = `${filename.charAt(0).toUpperCase()}${filename.slice(1)}`;
  filename = filename.split('-').map(word => `${word.charAt(0).toUpperCase()}${word.slice(1)}`).join(' ');
  return filename.replace('.md', '');
};
