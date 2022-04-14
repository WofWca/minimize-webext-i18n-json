//@ts-check

/**
 * @typedef {{
 *   [key: string]: {
 *     message: string,
 *     description?: string,
 *     placeholders?: {
 *       [key: string]: {
 *          content: string,
 *          example?: string,
 *       }
 *     },
 *   }
 * }} Messages
 */

/**
 * A polyfill for `String.replaceAll`.
 * @param {string} str
 * @param {string} substr
 * @param {string} newSubstr
 * @returns {string}
 */
function replaceAll(str, substr, newSubstr) {
  return str.split(substr).join(newSubstr);
}
/**
 * @param {string} str
 * @param {string} substr
 * @returns {number}
 */
function numOccurences(str, substr) {
  return str.split(substr).length - 1;
}

// TODO more ZIP-optimized substitutions (more widely-used letters should go first). See how Uglify.js does it.
const nameSubstitutionPool = 'abcdefghijklmnopqrstuvwxyz';
function* nameSubstitutionGenerator() {
  for (let i = 0; i < nameSubstitutionPool.length; i++) {
    yield nameSubstitutionPool[i];
  }
  // TODO in order to avoid this we can continue by putting several letters one after another.
  // Although browsers currently don't allow so many placeholders anyway. And neither do users write so many.
  throw new Error('Name substitution pool ran out');
}

/**
 * Mutates the `messageObj`.
 * @param {Messages[string]} messageObj
 */
function shortenPlaceholderNames(messageObj) {
  const placeholders = messageObj.placeholders;
  const placeholderNameSubstitutionGenerator = nameSubstitutionGenerator();
  for (const [placeholderName, pValue] of Object.entries(placeholders)) {
    const newPlaceholderName = placeholderNameSubstitutionGenerator.next().value;
    // TODO replace with direct placeholder usage?
    // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Internationalization#direct_placeholder_usage
    // As an option? Keep in mind that the same placeholder can be used several times in the same `"message"`.
    messageObj.message = replaceAll(messageObj.message, '$' + placeholderName + '$', '$' + newPlaceholderName + '$');
    delete placeholders[placeholderName];
    placeholders[newPlaceholderName] = pValue;
  }
}

/**
 * Mutates the `messageObj`
 * @param {Messages[string]} messageObj
 * @param {keyof Messages[string]['placeholders']} placeholderName
 */
function inlinePlaceholder(messageObj, placeholderName) {
  const placeholder = messageObj.placeholders[placeholderName];
  messageObj.message = replaceAll(messageObj.message, '$' + placeholderName + '$', placeholder.content);
  delete messageObj.placeholders[placeholderName];
}

/**
 * @param {string} json
 * @returns {string}
 */
// export default function(json) {
module.exports = function(json) {
  /** @type {Messages} */
  const o = JSON.parse(json);
  for (const [_key, messageObj] of Object.entries(o)) {
    delete messageObj.description;
    // const placeholders = messageObj.placeholders;
    if (messageObj.placeholders) {
      // const placeholderNameSubstitutionGenerator = nameSubstitutionGenerator();
      for (const [placeholderName, pValue] of Object.entries(messageObj.placeholders)) {
        // Technically unnecessary if we inline the placeholder
        delete pValue.example;

        // TODO can placeholders be used inside other placeholders? If so, we have a bug.

        // TODO it's also possible that `"message"` references a non-defined placeholder.
        // We could delete such references.
        // Though currently Chromium refuses to install such extensions anyway.

        if (numOccurences(messageObj.message, '$' + placeholderName + '$') <= 1) {
          // TODO still do inline if the output would actually get shorter. Check with `JSON.stringify(messageObj)`?
          inlinePlaceholder(messageObj, placeholderName);
        }
      }

      shortenPlaceholderNames(messageObj);

      // In case we inlined all the placeholders, or there were none in the first place.
      if (Object.keys(messageObj.placeholders).length <= 0) {
        delete messageObj.placeholders;
      }
    }
  }
  return JSON.stringify(o);
}
