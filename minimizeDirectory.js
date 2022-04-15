// @ts-check

const fs = require('fs/promises');
const path = require('path');
const minimizeJsonString = require('./minimizeJsonString');

/**
 * Minimizes files in the `_locales` directory in place (modifies the files). Make sure to `await` before using
 * the directory again.
 * @param {string} localesDir the path to the `_locales` directory.
 * @param {BufferEncoding} encoding
 * @example
 * await minimizeDirectory('dist/_locales');
 */
module.exports = async function(localesDir, encoding = 'utf8') {
  const langPaths = await fs.readdir(localesDir, { encoding });
  const doneP = Promise.all(langPaths.map(async (langPath) => {
    const pathToMessagesFile = path.resolve(localesDir, langPath, 'messages.json');
    let messagesFile;
    try {
      messagesFile = await fs.open(pathToMessagesFile, 'r+');
    } catch (e) {
      console.warn('Could not open file, ignoring:\n', e);
      // TODO make this optional?
      return;
    }
    try {
      const content = await messagesFile.readFile({ encoding });
      const minimized = minimizeJsonString(content);
      // I thought we could just `await messagesFile.writeFile(`, but apparently it just appends.
      await messagesFile.truncate(0);
      await messagesFile.write(minimized, 0, encoding);
    } finally {
      messagesFile.close();
    }
  }));
  await doneP;
}
