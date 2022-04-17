/**
 * @license
 * Copyright (C) 2022  WofWca <wofwca@protonmail.com>
 *
 * This file is part of minimize-webext-i18n-json.
 *
 * minimize-webext-i18n-json is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * minimize-webext-i18n-json is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with minimize-webext-i18n-json.  If not, see <https://www.gnu.org/licenses/>.
 */


// @ts-check

const fs = require('fs/promises');
const path = require('path');
const minimizeJsonString = require('./minimizeJsonString');

/**
 * Minimizes files in the `_locales` directory in place (modifies the files). Make sure to `await` before using
 * the directory again.
 * @param {string} localesDir the path to the `_locales` directory.
 * @param {Parameters<typeof minimizeJsonString>[1]} [options]
 * @param {BufferEncoding} encoding
 * @example
 * await minimizeDirectory('dist/_locales');
 */
module.exports = async function(localesDir, options, encoding = 'utf8') {
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
      const minimized = minimizeJsonString(content, options);
      // I thought we could just `await messagesFile.writeFile(`, but apparently it just appends.
      await messagesFile.truncate(0);
      await messagesFile.write(minimized, 0, encoding);
    } finally {
      messagesFile.close();
    }
  }));
  await doneP;
}
