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
