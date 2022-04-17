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
  function expectEq(actual, expected) {
    if (actual !== expected) {
      console.error('Test failed. Expected:\n', expected, '\ngot:\n', actual);
      throw new Error();
    }
  }
  {
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
    const expectSafe = JSON.stringify({
      hello: {
        message: "Hello, $NAME$!\n$additional$. By the way, $NAME$, nice hat! Oh, and before I forget, $3",
        placeholders: {
          "NAME": {
            content: "dear $1",
            // example: "dear World"
          },
          "additional": {
            content: "($2)",
          }
        }
      },
      weather: {
        message: "Great weather today, isn't it!?",
        // description: "A word about the weather"
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
    const expectUnsafe = JSON.stringify({
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
    });
    const resultSafe = minimizeJsonString(input);
    const resultUnsafe = minimizeJsonString(input, { unsafe: true });
    const spacesRemoved = resultSafe.startsWith('{"');
    if (!spacesRemoved) {
      console.error('Test failed. spaces not removed');
      throw new Error();
    }
    expectEq(resultSafe, expectSafe);
    expectEq(resultUnsafe, expectUnsafe);
  }

  // Unsafe tests:
  {
    const minimizeUnsafe = (input) => minimizeJsonString(input, { unsafe: true });
    // Candidate placeholder name is already contained in the string.
    // Already exists as a placeholder:
    expectEq(minimizeUnsafe(JSON.stringify({
      hello: {
        message: "$well$ $well$ $well$, $a$ $a$",
        placeholders: {
          "well": { content: "$1"},
          "a": { content: "$2"}
        }
      },
    })), JSON.stringify({
      hello: {
        message: "$b$ $b$ $b$, $c$ $c$",
        placeholders: {
          "b": { content: "$1"},
          "c": { content: "$2"}
        }
      },
    }));
    // Already exists as text between placeholders
    expectEq(minimizeUnsafe(JSON.stringify({
      hello: {
        message: "$EAT$a$BURGER$ $EAT$B$BURGER$",
        placeholders: {
          "EAT": { content: "$1" },
          "BURGER": { content: "$2" }
        }
      }
    })), JSON.stringify({
      hello: {
        message: "$c$a$d$ $c$B$d$",
        placeholders: {
          "c": { content: "$1" },
          "d": { content: "$2" }
        }
      }
    }));
  }

  console.log('Success!');
}
test();
