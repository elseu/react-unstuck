import { RefObject } from "react";
import { IGatheredElement } from "./gather";
import { ILabels, ISelectorFunction } from "./selectors";

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

export type IZIndexCalculation = (styles: ICssStyleData, layout: IProcessedStickyLayout) => number;

export type IStickyBehavior<S = any> = (
  params: IStickyParameters<S>
) => IStickyLayout;

export type IStickyLayout = null | IViewportStickyLayout;

interface IViewportStickyLayout {
  scrolling: boolean;
  top: number;
  z?: number;
  fixedHeight?: number;
}

export type IProcessedStickyLayout = null | IViewportProcessedStickyLayout;

interface IViewportProcessedStickyLayout {
  element: HTMLElement;
  scrolling: boolean;
  top: number;
  height: number;
  bottom: number;
  z: number;
  fixedHeight?: number;
}

export interface IStickyHandle {
  behavior: IStickyBehavior;
  behaviorState: any;
  labels: ILabels | undefined;
  selectorFunction: ISelectorFunction | undefined;
  placeholderRef: RefObject<HTMLElement | undefined>;
  update(stickyCopy: boolean, stickyCopyCss: ICssStyleData, layout: IProcessedStickyLayout): void;
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

export function elementRootOffset(element: HTMLElement): {
  top: number;
  left: number;
} {
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

export interface IStickyLayoutUpdateOptions {
  dryRun?: boolean;
  scrollTop?: number;
}

export function updateStickyLayout(
  stickyHandleElements: Array<IGatheredElement<IStickyHandle>>,
  scrollElement: HTMLElement | Window,
  respondsToIndexes: number[][],
  options?: IStickyLayoutUpdateOptions
): IProcessedStickyLayout[] {
  const { dryRun, scrollTop: scrollTopInput } = {
    dryRun: false,
    ...options,
  };

  const viewport = memoize(() => {
    let scrollTop: number = 0;
    if (dryRun && scrollTopInput !== undefined) {
      // Calculate the outcomes for a different scrollTop.
      scrollTop = scrollTopInput;
    } else if ("scrollY" in scrollElement) {
      scrollTop = scrollElement.scrollY;
    } else if ("scrollTop" in scrollElement) {
      scrollTop = scrollElement.scrollTop;
    } else if ("pageYOffset" in scrollElement) {
      // @ts-ignore (because of pageYOffset is not in window typing)
      scrollTop = scrollElement.pageYOffset;
    }

    return {
      element: scrollElement,
      height:
        "offsetHeight" in scrollElement
          ? scrollElement.offsetHeight
          : scrollElement.innerHeight,
      scrollTop,
      topOffset:
        "nodeType" in scrollElement ? elementRootOffset(scrollElement).top : 0,
    };
  });

  const elementParams = (gatheredElement: IGatheredElement<IStickyHandle>) =>
    memoize(() => {
      const placeholder = gatheredElement.data.placeholderRef.current;
      return {
        viewportTop:
          elementRootOffset(placeholder ? placeholder : gatheredElement.element)
            .top -
          viewport().topOffset -
          viewport().scrollTop,
        height: gatheredElement.element.offsetHeight,
      };
    });

  const layouts: Array<IProcessedStickyLayout | undefined> =
    stickyHandleElements.map(() => undefined);

  const prevStickyForIndex = (
    i: number,
    selectedStickyIndexes: number[]
  ): IProcessedStickyLayout => {
    const stickies = prevStickiesForIndex(i, selectedStickyIndexes);
    return stickies.length === 0 ? null : stickies[stickies.length - 1];
  };

  const prevStickiesForIndex = (
    i: number,
    selectedStickyIndexes: number[]
  ): IViewportProcessedStickyLayout[] => {
    return selectedStickyIndexes
      .filter((index) => index < i)
      .map((index) => layouts[index])
      .filter(
        (layout) => layout !== undefined && layout !== null
      ) as IViewportProcessedStickyLayout[];
  };

  const prevElementParamsForIndex = (
    i: number,
    selectedStickyIndexes: number[]
  ): (() => IElementParameters | null) => {
    const indexes = selectedStickyIndexes.filter((index) => index < i);
    if (indexes.length === 0) {
      return () => null;
    }
    return elementParams(stickyHandleElements[indexes[indexes.length - 1]]);
  };
  const nextElementParamsForIndex = (
    i: number,
    selectedStickyIndexes: number[]
  ): (() => IElementParameters | null) => {
    const indexes = selectedStickyIndexes.filter((index) => index > i);
    if (indexes.length === 0) {
      return () => null;
    }
    return elementParams(stickyHandleElements[indexes[0]]);
  };

  const layoutForIndex = (i: number): IProcessedStickyLayout => {
    if (typeof layouts[i] !== "undefined") {
      return layouts[i] as IProcessedStickyLayout;
    }
    if (layouts.length <= i) {
      return null;
    }

    const { data: handle, element } = stickyHandleElements[i];
    const selectedStickyIndexes = respondsToIndexes[i];

    const layout = handle.behavior({
      viewport,
      state: handle.behaviorState,
      index: i,
      element: elementParams(stickyHandleElements[i]),
      prev: () => (i === 0 ? null : layoutForIndex(i - 1)),
      prevSticky: () => prevStickyForIndex(i, selectedStickyIndexes),
      prevStickies: () => prevStickiesForIndex(i, selectedStickyIndexes),
      prevElement: prevElementParamsForIndex(i, selectedStickyIndexes),
      nextElement: nextElementParamsForIndex(i, selectedStickyIndexes),
    });

    const processedLayout = processStickyLayout(layout, element, i);
    layouts[i] = processedLayout;
    return processedLayout;
  };

  const resultLayouts: IProcessedStickyLayout[] = [];

  stickyHandleElements.forEach((stickyHandleElement, i) => {
    const layout = layoutForIndex(i);
    resultLayouts[i] = layout;

    const placeholder = stickyHandleElement.data.placeholderRef.current;
    const offsetParent = (
      placeholder ? placeholder : stickyHandleElement.element
    ).offsetParent as HTMLElement;
    const parentOffset =
      offsetParent === scrollElement
        ? { top: 0, left: 0 }
        : elementRootOffset(offsetParent);
    const placeholderOffset = placeholder
      ? elementRootOffset(placeholder)
      : { top: 0, left: 0 };
    const placeholderWidth = placeholder ? placeholder.offsetWidth : null;
    if (!dryRun) {
      const { sticky, cssProps } = cssifyStickyLayout(
        layout,
        viewport,
        parentOffset,
        placeholderOffset,
        placeholderWidth
      );
      stickyHandleElement.data.update(sticky, cssProps, layout);
    }
  });

  return resultLayouts;
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
  return { element, height, bottom, z, ...layout };
}

function cssifyStickyLayout(
  layout: IProcessedStickyLayout,
  viewport: () => IViewportParameters,
  parentOffset: { top: number; left: number },
  placeholderOffset: { top: number; left: number },
  placeholderWidth: number | null
): { sticky: boolean; cssProps: ICssStyleData } {
  let cssProps: ICssStyleData = {
    left: null,
    top: null,
    zIndex: 1,
    width: "100%",
    height: "auto",
  };

  if (layout === null) {
    return { sticky: false, cssProps };
  }

  const sticky = true;
  const { top, z, fixedHeight } = layout;
  const { scrollTop, topOffset } = viewport();
  const zIndex = z + 1000;

  if (layout.scrolling) {
    cssProps = {
      left: placeholderOffset.left - parentOffset.left + "px",
      position: "absolute",
      top: top + scrollTop - parentOffset.top + "px",
      width: placeholderWidth !== null ? placeholderWidth + "px" : "100%",
      height: fixedHeight === undefined ? "auto" : fixedHeight + "px",
      zIndex,
    };
  } else {
    cssProps = {
      left: placeholderOffset.left + "px",
      position: "fixed",
      top: top + topOffset + "px",
      width: placeholderWidth !== null ? placeholderWidth + "px" : "100%",
      height: fixedHeight === undefined ? "auto" : fixedHeight + "px",
      zIndex,
    };
  }
  return { sticky, cssProps };
}
