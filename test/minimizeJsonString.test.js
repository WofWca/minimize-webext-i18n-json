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

// import { minimizeJsonString } from '../index.js';
const { minimizeJsonString } = require('../index.js');

function test() {
  const input = JSON.stringify({
    hello: {
      message: "Hello, $NAME$!\n$additional$. By the way, $NAME$, nice hat! Oh, and before I forget, $3",
      placeholders: {
        "NAME": {
          content: "dear $1",
          example: "dear World"
        },
        "additional": {
          content: "($2)",
        }
      }
    },
    weather: {
      message: "Great weather today, isn't it!?",
      description: "A word about the weather"
    },
    bye: {
      message: "Bye now, $friendName$!",
      placeholders: {
        friendName: {
          content: "$1"
        }
      }
    }
  });
  const expect = JSON.stringify({
    hello: {
      message: "Hello, $a$!\n($2). By the way, $a$, nice hat! Oh, and before I forget, $3",
      placeholders: {
        // Used more than once, don't inline
        "a": {
          content: "dear $1",
          // example: "dear World"
        },
        // "additional": {
        //   content: "($2)",
        // }
      }
    },
    weather: {
      message: "Great weather today, isn't it!?"
      // description: "A word about the weather"
    },
    bye: {
      message: "Bye now, $1!",
      // placeholders: {
      //   friendName: {
      //     content: "$1"
      //   }
      // }
    }
  })
  const result = minimizeJsonString(input);
  const spacesRemoved = result.startsWith('{"');
  if (result !== expect || !spacesRemoved) {
    console.error('Test failed. Expected:\n', JSON.parse(expect), '\ngot:\n', JSON.parse(result));
    throw new Error();
  }
  console.log('Success!');
}
test();
