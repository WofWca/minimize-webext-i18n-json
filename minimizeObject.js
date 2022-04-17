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
/**
 * @param {string} str
 * @param {string} substr
 * @returns {number}
 */
function numOccurencesCaseInsensitive(str, substr) {
  return numOccurences(str.toLowerCase(), substr.toLowerCase());
}
/**
 * @param {string} str
 * @param {string} substr
 * @returns {boolean}
 */
function containsInDifferentCase(str, substr) {
  return numOccurences(str, substr) !== numOccurencesCaseInsensitive(str, substr);
}
/**
 * When this happens, we don't know how the browser will behave - will it recognize the placeholder, disregarding the
 * fact that it's written in a different case? Will it replace it with an empty string? Will it keep it as it is?
 * @param {string} messageStr
 * @param {string} placeholderName
 */
function placeholderUsageCaseInconsistent(messageStr, placeholderName) {
  return containsInDifferentCase(messageStr, '$' + placeholderName + '$');
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
    if (placeholderUsageCaseInconsistent(messageObj.message, placeholderName)) {
      continue;
    }

    // So we don't replace `"$EAT$a$BURGER$"` with `"$a$a$b"`, but with `$b$a$c$`, so it doesn't start
    // looking like there are two possible positions for the `$a$` placeholder).
    let newPlaceholderName;
    do {
      newPlaceholderName = placeholderNameSubstitutionGenerator.next().value;
    } while (numOccurencesCaseInsensitive(messageObj.message, '$' + newPlaceholderName + '$') >= 1);

    messageObj.message = replaceAll(messageObj.message, '$' + placeholderName + '$', '$' + newPlaceholderName + '$');
    delete placeholders[placeholderName];
    placeholders[newPlaceholderName] = pValue;
  }
}

/**
 * // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Internationalization#direct_placeholder_usage
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
 * Minimizes the messagesObject by mutating it.
 * @param {Messages} messagesObject
 * @param {Object} [options]
 * @param {boolean} [options.unsafe] - whether to use minimizations that may cause change in behavior,
 * including possibly making the messages file invalid, which can make it impossible to install the extension
 * (possibly only specifically in that language, which would be harded to detect).
 * It is okay to use this if you review the original l10n files and do not notice anything that looks suspicious
 * or like it could lead to undefined behavior. For example using different casing for placeholder definition and usage.
 * Or something like this: `"message": "$AA$BB$"`, or this: `"placeholders": { "n$ame": ... }`
 * @returns {void}
 */
// export default function(messagesObject) {
module.exports = function(messagesObject, { unsafe = false } = {}) {
  for (const [_key, messageObj] of Object.entries(messagesObject)) {
    delete messageObj.description;
    // const placeholders = messageObj.placeholders;
    if (messageObj.placeholders) {
      // const placeholderNameSubstitutionGenerator = nameSubstitutionGenerator();
      for (const [placeholderName, pValue] of Object.entries(messageObj.placeholders)) {
        delete pValue.example;

        if (unsafe) {
          // TODO can placeholders be used inside other placeholders? If so, we have a bug.

          // TODO it's also possible that `"message"` references a non-defined placeholder.
          // We could delete such references.
          // Though currently Chromium refuses to install such extensions anyway.

          if (
            !placeholderUsageCaseInconsistent(messageObj.message, placeholderName)
            // TODO still do inline if the output would actually get shorter. Check with `JSON.stringify(messageObj)`?
            && numOccurences(messageObj.message, '$' + placeholderName + '$') <= 1
          ) {
            inlinePlaceholder(messageObj, placeholderName);
          }
        }
      }

      if (unsafe) {
        shortenPlaceholderNames(messageObj);
      }

      // In case we inlined all the placeholders, or there were none in the first place.
      if (Object.keys(messageObj.placeholders).length <= 0) {
        delete messageObj.placeholders;
      }
    }
  }
}
