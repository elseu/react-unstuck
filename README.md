# Unstuck

Sticky scrolling with custom behaviors

- [Installation](#installation)
- [Overview](#overview)
- [Features](#features)
- [Getting started](#getting-started)
- [Behaviors](#behaviors)
- [Components](#components)
  - [Sticky](#sticky)
  - [StickyContainer](#stickycontainer)
  - [StickyScrollContainer](#stickyscrollcontainer)
  - [StickyConfigProvider](#stickyconfigprovider)
- [Hooks](#hooks)
- [Custom behaviors](#custom-behaviors)
- [Custom sticky interactions](#custom-sticky-interactions)
- [Compatibility](#compatibility)
- [Typescript](#typescript)
- [Developers](#developers)

## Installation

`npm install -S react-unstuck`

## Overview

Sticky headers are difficult to get right. Sometimes you need more flexibility than `position: sticky` can provide, but making it work consistently and with decent scroll performance is a huge challenge. Unstuck aims to make custom sticky behavior fast and easy.

## Features

- High-performance for buttery-smooth scrolling.
- Multiple useful predefined behaviors for common designs.
- Helps you define your own custom behaviors easily.
- Allows you to scroll page elements into view while taking into account the position of sticky headers.
- Can be used with window scrolling or `overflow: scroll` elements.
- SSR compatible.
- Design system agnostic.

## Getting started

The core principle of Unstuck is simple:

```jsx
<StickyContainer>
  ...some content...
  <Sticky>
    <h1>This title becomes sticky when it hits the top of the screen</h1>
  </Sticky>
  ...more content...
</StickyContainer>
```

1. Wrap the content that contains sticky elements with a single `<StickyContainer>`.
2. Wrap every sticky element inside a `<Sticky>`.

But the real magic of Unstuck comes into play when you use multiple Sticky elements, or custom behaviors:

```jsx
<StickyContainer>
  ...some content...
  <Sticky behavior={shiftToTop}>
    <h1>This title is sticky</h1>
  </Sticky>
  ...more content...
  <Sticky behavior={shiftToTop}>
    <h1>
      But when this title reaches the top, it pushes the previous title away
    </h1>
  </Sticky>
  ...more content...
  <Sticky behavior={stickToTopAndScrollDown}>
    <div>
      This element scrolls out of view, but comes right back down into view when
      you scroll up
    </div>
  </Sticky>
  ...more content...
</StickyContainer>
```

You can even switch sticky behavior dynamically!

## Behaviors

Unstuck comes out of the box with the following behaviors:

- **stickToTop**: the element scrolls, but when it hits the top of the screen, it stays there. Any sticky elements that follow will stick _underneath_ it.
- **shiftToTop**: works like stickToTop, but when the next sticky elements scrolls in from beneath and hits it, this sticky will scroll out of the way. (An effect you may know from lists in iOS.)
- **stickToTopAndScrollDown**: the element scrolls out of view as if it isn't sticky at all, but as soon as the user scrolls up, this element comes back into view along with the scroll motion. Very useful for UIs where you want to reduce clutter but keep headings or toolbars available in a "peekable" place.
- **stickToTopFullHeight**: as the element scrolls into view, it keeps growing to fill the bottom of the screen until it is 100% high. Useful for sidebars that scroll into view and should then stay in place.
- **notSticky**: the element is not sticky at all. Use this if you want to determine dynamically whether your element should be sticky: `behavior={someCondition ? stickToTop: notSticky}`.

## Components

### Sticky

The star of the show. Wrap an element inside `<Sticky>` to give it sticky scrolling behavior. Sticky is implemented as a `<div>` and you can set all attributes on it that you would be able to set on a div.

You must pass a behavior for the Sticky element with the `behavior` property. This is fully dynamic: you can change behaviors on the fly if you want.

As your element becomes sticky, its positioning in the page layout changes. To prevent the lower elements of the page from shifting up, Sticky creates an invisible placeholder element in its place that will maintain the same shape and size in the page.

Properties:

- `behavior: IStickyBehavior`: one of the predefined [behaviors](#behaviors), or a [custom behavior](#custom-behaviors).
- `defaultZIndex?: number`: the z-index for the sticky div while it is not sticky.
- `labels?: ILabels`: see [custom sticky interactions](#custom-sticky-interactions).
- `respondsTo?: ISelectorFunction`: see [custom sticky interactions](#custom-sticky-interactions).

### StickyContainer

You have to wrap all your sticky elements inside a single top-level `<StickyContainer>` to allow them to coordinate with each another.

Properties:

- (none)

### StickyScrollContainer

TODO

### StickyConfigProvider

TODO

## Hooks

TODO

## Custom behaviors

TODO

## Custom sticky interactions

TODO

## Compatibility

Unstuck is compatible with most normal React libraries. However, libraries that directly move or delete DOM elements outside of React may cause trouble. This may happen with certain animation frameworks that perform their own DOM manipulation to improve performance. If you see unexpected behavior, turn up the verbosity level of the Web Inspector console and look for debug messages that say `some expected Sticky elements are not present in the DOM`. Unfortunately there is no one-size-fits-all solution.

## Typescript

`react-unstuck` supports Typescript and contains generic typings. Of course you can also use it in plain old Javascript.

## Developers

Developed by [Sebastiaan Besselsen](https://github.com/sbesselsen), [Daphne Smit](https://github.com/daphnesmit), and [Lennard Westerveld](https://github.com/LennardWesterveld) at [Sdu Uitgevers](https://www.sdu.nl), The Netherlands.
