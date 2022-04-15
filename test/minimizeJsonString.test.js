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
