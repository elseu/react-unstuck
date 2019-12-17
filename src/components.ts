import {
  FC,
  createElement,
  Fragment,
  Ref,
  useCallback,
  useEffect,
  useState,
  useMemo,
  memo,
  Children,
  cloneElement,
  ReactElement,
  useRef,
  CSSProperties
} from "react";
import { GatherContainer, useGather, useGatheredElements } from "./gather";
import { useScrollEvent, useScrollElement, ScrollContainer } from "./scroll";
import {
  IStickyBehavior,
  updateStickyLayout,
  IStickyHandle,
  ICssStyleData
} from "./calc";

export type IStickyScrollContainerProps = {
  element: ReactElement<{ ref: (element: HTMLElement | null) => void }>;
} | {
  className?: string;
  style?: CSSProperties;
  type?: string;
}

// A container that supports scrolling with sticky elements.
export const StickyScrollContainer: FC<IStickyScrollContainerProps> = ({ children, ...props }) => {
  return createElement(
    ScrollContainer,
    props,
    createElement(
      StickyContainer,
      {},
      children
    )
  );
};

// A container that supports scrolling with sticky elements.
export const StickyContainer: FC<{}> = ({ children }) => {
  return createElement(
    GatherContainer,
    {},
    createElement(StickyLayoutContainer, {}, children)
  );
};

export interface IStickyProps {
  behavior: IStickyBehavior;
}

function isReactElementWithRef(
  elem: any
): elem is ReactElement<{ ref: Ref<any> }> {
  return "type" in elem;
}

let aap = 0;

export const Sticky: FC<IStickyProps> = memo(({ behavior, children }) => {
  const cssProps = useRef<ICssStyleData>({ display: "none" });
  const stickyCopyRef = useRef<HTMLElement>();
  const behaviorState = useRef<any>({});

  const handle: IStickyHandle = useMemo(
    () => ({
      behavior,
      behaviorState: behaviorState.current,
      update: (sticky, stickyCssProps) => {
        stickyCssProps["display"] = sticky ? "block" : "none";
        cssProps.current = stickyCssProps;
        if (stickyCopyRef.current) {
          // Immediately set the style.
          for (const k of Object.keys(stickyCssProps)) {
            stickyCopyRef.current.style[k as any] = stickyCssProps[k];
          }
        }
      }
    }),
    [behavior, cssProps, stickyCopyRef]
  );

  const ref = useGather(handle);
  const fixedElement = createElement(
    "div",
    { style: cssProps.current, ref: stickyCopyRef },
    children
  );

  let haveMappedRef = false;
  const childrenWithRef = Children.map(children, child => {
    if (!haveMappedRef && isReactElementWithRef(child)) {
      haveMappedRef = true;
      return cloneElement(child, { ref });
    }
    return child;
  });

  return createElement(Fragment, {}, childrenWithRef, fixedElement);
});

function isStickyHandle(elem: any): elem is IStickyHandle {
  return "behavior" in elem && typeof elem.update === "function";
}

// A container that lays out sticky components and makes sure they are updated properly.
const StickyLayoutContainer: FC<{}> = ({ children }) => {
  const stickyHandleElements = useGatheredElements(isStickyHandle);
  const scrollElement = useScrollElement();

  const updateLayout = useCallback(
    (scrollElement: HTMLElement | Window) => {
      updateStickyLayout(stickyHandleElements, scrollElement);
    },
    [stickyHandleElements]
  );

  useEffect(() => {
    updateLayout(scrollElement);
    return () => {
      updateLayout(scrollElement);
    };
  }, [scrollElement, updateLayout]);

  useScrollEvent(
    info => {
      updateLayout(info.scrollElement);
    },
    [updateLayout, updateLayout]
  );

  return createElement(Fragment, {}, children);
};
