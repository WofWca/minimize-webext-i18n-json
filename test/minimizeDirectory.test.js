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
const { minimizeDirectory, minimizeJsonString } = require('..');

async function test(keepTempFiles = false) {
  const localesParent = ['test', 'testData'];
  const originalsDir = path.resolve(...localesParent, '_locales');
  const testDir = path.resolve(...localesParent, '_locales_output')
  await fs.rm(testDir, { recursive: true, force: true });
  await fs.cp(originalsDir, testDir, { recursive: true });
  const encoding = 'utf8';

  const minimizeP = minimizeDirectory(testDir);

  const langPaths = await fs.readdir(testDir, { encoding });
  const langPathDonePromises = langPaths.map(async (langPath) => {
    // TODO do not throw if there are other non-messages files in the directory.
    const originalMessagesFileP = fs.open(path.resolve(originalsDir, langPath, 'messages.json'), 'r');
    const minimizedMessagesFileP = minimizeP.then(
      () => fs.open(path.resolve(testDir, langPath, 'messages.json'), 'r')
    );
    let equal = false;
    try {
      const originalContentP = originalMessagesFileP.then(f => f.readFile({ encoding }));
      const minimizedContentP = minimizedMessagesFileP.then(f => f.readFile({ encoding }));
      const minimizedNow = minimizeJsonString(await originalContentP);
      equal = minimizedNow === await minimizedContentP;
    } finally {
      (await originalMessagesFileP).close();
      (await minimizedMessagesFileP).close();
    }
    if (!equal) {
      throw new Error('Content is not equal');
    }
  });

  await Promise.allSettled(langPathDonePromises); // Finished
  if (!keepTempFiles) {
    await fs.rm(testDir, { recursive: true })
  }

  await Promise.all(langPathDonePromises);
  console.log('Success!');
}

test();
