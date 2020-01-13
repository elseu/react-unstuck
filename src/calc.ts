import { RefObject } from "react";
import { IGatheredElement } from "./gather";

export interface ICssStyleData {
  [k: string]: any;
}

interface IViewportParameters {
  element: Window | HTMLElement;
  scrollTop: number;
  topOffset: number;
  height: number;
}

interface IElementParameters {
  element: HTMLElement;
  viewportTop: number;
  height: number;
}

export interface IStickyParameters<S = any> {
  state: S;
  index: number;
  viewport(): IViewportParameters;
  element(): IElementParameters;
  prev(): IProcessedStickyLayout;
  prevSticky(): IProcessedStickyLayout;
  prevStickies(): IViewportProcessedStickyLayout[];
  prevElement(): IElementParameters | null;
  nextElement(): IElementParameters | null;
}

export type IStickyBehavior<S = any> = (
  params: IStickyParameters<S>
) => IStickyLayout;

export type IStickyLayout = null | IViewportStickyLayout;

interface IViewportStickyLayout {
  scrolling: boolean;
  top: number;
  z?: number;
}

export type IProcessedStickyLayout = null | IViewportProcessedStickyLayout;

interface IViewportProcessedStickyLayout {
  scrolling: boolean;
  top: number;
  height: number;
  bottom: number;
  z: number;
}

export interface IStickyHandle {
  behavior: IStickyBehavior;
  behaviorState: any;
  placeholderRef: RefObject<HTMLElement | undefined>;
  update(stickyCopy: boolean, stickyCopyCss: ICssStyleData): void;
}

function memoize<T>(f: () => T): () => T {
  let computed = false;
  let result: T | undefined;
  return () => {
    if (!computed) {
      result = f();
      computed = true;
    }
    return result as T;
  };
}

function elementRootOffset(
  element: HTMLElement
): { top: number; left: number } {
  let top = 0;
  let left = 0;
  let elem: HTMLElement | null = element;
  while (elem !== null) {
    top += elem.offsetTop;
    left += elem.offsetLeft;
    elem = elem.offsetParent as HTMLElement;
  }
  return { top, left };
}

export function updateStickyLayout(
  stickyHandleElements: Array<IGatheredElement<IStickyHandle>>,
  scrollElement: HTMLElement | Window
): void {
  const viewport = memoize(() => ({
    element: scrollElement,
    height:
      "offsetHeight" in scrollElement
        ? scrollElement.offsetHeight
        : scrollElement.innerHeight,
    scrollTop:
      "scrollY" in scrollElement
        ? scrollElement.scrollY
        : scrollElement.scrollTop,
    topOffset:
      "nodeType" in scrollElement ? elementRootOffset(scrollElement).top : 0
  }));

  const elementParams = (gatheredElement: IGatheredElement<IStickyHandle>) =>
    memoize(() => {
      const placeholder = gatheredElement.data.placeholderRef.current;
      return {
        viewportTop:
          elementRootOffset(placeholder ? placeholder : gatheredElement.element)
            .top -
          viewport().topOffset -
          viewport().scrollTop,
        height: gatheredElement.element.offsetHeight
      };
    });

  const layouts: Array<
    IProcessedStickyLayout | undefined
  > = stickyHandleElements.map(() => undefined);

  const prevStickyForIndex = (i: number): IProcessedStickyLayout => {
    const stickies = prevStickiesForIndex(i);
    return stickies.length === 0 ? null : stickies[stickies.length - 1];
  };

  const prevStickiesForIndex = (
    i: number
  ): IViewportProcessedStickyLayout[] => {
    return layouts
      .slice(0, i)
      .filter(
        layout => layout !== undefined && layout !== null
      ) as IViewportProcessedStickyLayout[];
  };

  const layoutForIndex = (i: number): IProcessedStickyLayout => {
    if (typeof layouts[i] !== "undefined") {
      return layouts[i] as IProcessedStickyLayout;
    }
    if (layouts.length <= i) {
      return null;
    }

    const { data: handle, element } = stickyHandleElements[i];

    const layout = handle.behavior({
      viewport,
      state: handle.behaviorState,
      index: i,
      element: elementParams(stickyHandleElements[i]),
      prev: () => (i === 0 ? null : layoutForIndex(i - 1)),
      prevSticky: () => prevStickyForIndex(i),
      prevStickies: () => prevStickiesForIndex(i),
      prevElement:
        i === 0 ? () => null : elementParams(stickyHandleElements[i - 1]),
      nextElement:
        i >= layouts.length - 1
          ? () => null
          : elementParams(stickyHandleElements[i + 1])
    });

    const processedLayout = processStickyLayout(layout, element, i);
    layouts[i] = processedLayout;
    return processedLayout;
  };

  stickyHandleElements.forEach((stickyHandleElement, i) => {
    const layout = layoutForIndex(i);
    const offsetParent = stickyHandleElement.element
      .offsetParent as HTMLElement;
    const parentOffset =
      offsetParent === scrollElement
        ? { top: 0, left: 0 }
        : elementRootOffset(offsetParent);
    const { sticky, cssProps } = cssifyStickyLayout(
      layout,
      viewport,
      parentOffset
    );
    stickyHandleElement.data.update(sticky, cssProps);
  });
}

function processStickyLayout(
  layout: IStickyLayout,
  element: HTMLElement,
  index: number
): IProcessedStickyLayout {
  if (layout === null) {
    return null;
  }
  const height = element.offsetHeight;
  const bottom = layout.top + height;
  const z = layout.z ?? -1 * index;
  return { height, bottom, z, ...layout };
}

function cssifyStickyLayout(
  layout: IProcessedStickyLayout,
  viewport: () => IViewportParameters,
  parentOffset: { top: number; left: number }
): { sticky: boolean; cssProps: ICssStyleData } {
  let cssProps: ICssStyleData = {
    left: "inherit",
    right: "inherit",
    top: "inherit",
    zIndex: "inherit"
  };

  if (layout === null) {
    return { sticky: false, cssProps };
  }

  const sticky = true;
  const { top, z } = layout;
  const { scrollTop, topOffset, element } = viewport();
  const zIndex = 1000 + z;

  if (layout.scrolling) {
    cssProps = {
      left: 0,
      position: "absolute",
      right: 0,
      top: top + scrollTop - parentOffset.top + "px",
      zIndex
    };
  } else {
    const windowWidth = window.innerWidth;
    const marginElement = "nodeType" in element ? element : document.body;
    cssProps = {
      left: parentOffset.left + "px",
      position: "fixed",
      right: windowWidth - marginElement.offsetWidth - parentOffset.left + "px",
      top: top + topOffset + "px",
      zIndex
    };
  }
  return { sticky, cssProps };
}
