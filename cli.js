#!/usr/bin/env node

// @ts-check

const minimizeDirectory = require('./minimizeDirectory');

let localesPath = process.argv[2];
if (localesPath === undefined) {
  localesPath = '_locales';
}
minimizeDirectory(localesPath);
