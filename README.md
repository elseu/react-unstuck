# Unstuck

Sticky scrolling with custom behaviors

TODO

- [Installation](#installation)
- [Overview](#overview)
- [Compatibility with other libraries](#compatibility-with-other-libraries)
- [Typescript](#typescript)
- [Developer](#developer)

## Installation

`npm install -S react-unstuck`

## Overview

TODO!

## Compatibility with other libraries

This tool is compatible with most normal React libraries. However, libraries that directly move or delete DOM elements outside of React may cause trouble. This may happen with certain animation frameworks that perform their own DOM manipulation to improve performance. If you see unexpected behavior, turn up the verbosity level of the Web Inspector console and look for debug messages that say `some expected Sticky elements are not present in the DOM`. Unfortunately there is no one-size-fits-all solution.

## Typescript

`react-unstuck` supports Typescript and contains generic typings. Of course you can also use it in plain old Javascript.

## Developer

Developed by [Sebastiaan Besselsen](https://github.com/sbesselsen) at [Sdu Uitgevers](https://www.sdu.nl), The Netherlands.
