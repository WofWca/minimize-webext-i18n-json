# minimize-webext-i18n-json

🗜 Minimize browser extensions' `_locales/*/messages.json` files. Remove "description", "example", spaces, inline placeholders.

## Example

Input:

```json
{
  "hello": {
    "message": "Hello, $NAME$!",
    "description": "Greeting",
    "placeholders": {
      "NAME": {
        "content": "dear $1",
        "example": "dear World"
      }
    }
  }
}
```

Output:

```json
{"hello":{"message":"Hello, dear $1!"}}
```

## Usage

### With a build script

Either

* ```js
  const { minimizeDirectory } = require('minimize-webext-i18n-json');
    // ...
    // After you've put `_locales` in `dist`:
    await minimizeDirectory('_locales');
  ```

* Or:

  ```js
  const { minimizeJsonString } = require('minimize-webext-i18n-json');
    // ...
    // for each `messages.json` file.
    const minimizedFileContentString = minimizeJsonString(fileContentString);

    // or
    // const { minimizeObject } = require('minimize-webext-i18n-json');
    // const object = JSON.parse(fileContentString);
    // minimizeObject(object);
    // const minimizedFileContentString = JSON.stringify(object);
  ```

### I don't use a build script

1. Make sure you have no uncommitted changes in `_locales`.
1. Run `npx minimize-webext-i18n-json _locales`.
1. Run `git checkout -- _locales` to revert the changes.
<!-- 3. Make an archive for distribution. -->

### Webpack

If you're using `copy-webpack-plugin` for your `_locales` files, just add the `transform` key:

```js
new CopyPlugin({
  patterns: [
    {
      from: '_locales/*/messages.json',
      transform: (content) => minimizeWebextI18nJson(content),
```

## Unsafe minimizations

They're off by default. These currently include placeholder inlining and placeholder name shortening. As the name implies, they're not safe. See the functions' docstrings for more info.

To enable these, pass `{ unsafe: true }` as the second argument:

```js
minimizeDirectory('_locales', { unsafe: true })
```

For CLI, pass `unsafe` as the second argument (ordering matters):

```bash
npx minimize-webext-i18n-json _locales unsafe
```

<br>
<br>
<br>

[![GPLv3 Logo](https://www.gnu.org/graphics/gplv3-with-text-136x68.png)](./COPYING)
