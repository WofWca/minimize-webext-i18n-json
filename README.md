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

Put roughly this in your bundle script:

```js
const minimizeWebextI18nJson = require('minimize-webext-i18n-json');
  // for each `messages.json` file.
  const minimizedFileContentString = minimizeWebextI18nJson(fileContentString);
```

### Webpack

If you're using `copy-webpack-plugin` for your `_locales` files, just add the `transform` key:

```js
new CopyPlugin({
  patterns: [
    {
      from: '_locales/*/messages.json',
      transform: (content) => minimizeWebextI18nJson(content),
```
