import { IStickyBehavior } from "./calc";

export const notSticky: IStickyBehavior = () => null;

export const stickToTop: IStickyBehavior = ({ element, prevStickies }) => {
  const minTop = Math.max(0, ...prevStickies().map(sticky => sticky.bottom));
  if (element().viewportTop < minTop) {
    return {
      scrolling: false,
      top: minTop
    };
  }
  return null;
};

export const shiftToTop: IStickyBehavior = ({
  element,
  nextElement,
  prevStickies
}) => {
  const minTop = Math.max(0, ...prevStickies().map(sticky => sticky.bottom));
  const elementViewportTop = element().viewportTop;
  if (elementViewportTop >= minTop) {
    // Element is down the page, no sticky behavior.
    return null;
  }

  const elementHeight = element().height;

  const nextElementTop = nextElement()?.viewportTop;
  if (nextElementTop !== undefined && nextElementTop < minTop + elementHeight) {
    if (nextElementTop <= 0) {
      return null;
    }
    return {
      scrolling: true,
      top: nextElementTop - element().height
    };
  }

  return {
    scrolling: false,
    top: minTop
  };
};

interface IScrollDirectionState {
  prevScrollTop?: number;
  anchorScrollTop?: number;
  prevScrollDirection?: "up" | "down";
  prevHeight?: number;
}

export const stickToTopAndScrollDown: IStickyBehavior<IScrollDirectionState> = ({
  element,
  viewport,
  state,
  prevStickies
}) => {
  // If we are below the viewport top, do nothing.
  const prevStickyBottom = Math.max(
    0,
    ...prevStickies().map(sticky => sticky.bottom)
  );
  const { viewportTop, height } = element();

  const { prevScrollTop = 0, prevScrollDirection } = state;
  let { anchorScrollTop } = state;
  const { prevHeight } = state;

  if (
    anchorScrollTop !== undefined &&
    prevHeight !== undefined &&
    prevHeight !== height
  ) {
    // The element's height has changed. Recompute the anchor scroll top.
    anchorScrollTop += height - prevHeight;
    state.anchorScrollTop = anchorScrollTop;
  }
  state.prevHeight = height;

  const { scrollTop } = viewport();
  const scrollDirection = scrollTop >= prevScrollTop ? "down" : "up";
  state.prevScrollTop = scrollTop;

  if (viewportTop >= prevStickyBottom) {
    delete state.anchorScrollTop;
    return null;
  }

  if (anchorScrollTop === undefined && scrollDirection === "up") {
    // Set the anchor point.
    // Simulate that we have already scrolled up by 1 pixel, so we immediately see something.
    anchorScrollTop = state.anchorScrollTop = scrollTop + 1;
  } else if (
    anchorScrollTop !== undefined &&
    anchorScrollTop <= scrollTop &&
    scrollDirection === "down"
  ) {
    // We have moved the sticky element out of screen.
    anchorScrollTop = undefined;
    delete state.anchorScrollTop;
  } else if (
    anchorScrollTop !== undefined &&
    scrollDirection === "down" &&
    prevScrollDirection === "up" &&
    scrollTop < anchorScrollTop - height
  ) {
    // We have started to scroll down while anchored at the top.
    // Move us down 1 pixel to shake us loose.
    anchorScrollTop = state.anchorScrollTop = scrollTop + height;
  }
  state.prevScrollDirection = scrollDirection;

  // Not sticky.
  if (anchorScrollTop === undefined) {
    return null;
  }

  if (scrollTop < anchorScrollTop - height) {
    // Stick to top.
    return {
      scrolling: false,
      top: prevStickyBottom
    };
  }

  if (prevStickyBottom + anchorScrollTop - scrollTop < viewportTop + height) {
    // The normal element would peek out under the sticky element. Don't stick.
    return null;
  }

  // Scroll into or out of view.
  return {
    scrolling: true,
    top: prevStickyBottom + anchorScrollTop - scrollTop - height
  };
};
