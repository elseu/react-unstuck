import {
  createElement,
  CSSProperties,
  FC,
  Fragment,
  HTMLAttributes,
  memo,
  ReactElement,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef
} from "react";
import {
  ICssStyleData,
  IStickyBehavior,
  IStickyHandle,
  updateStickyLayout
} from "./calc";
import {
  GatherContainer,
  IGatheredElement,
  useGather,
  useGatheredElements
} from "./gather";
import {
  ScrollContainer,
  useResizeEvent,
  useScrollElement,
  useScrollEvent
} from "./scroll";
import { ILabels, ISelectorFunction } from "./selectors";

export type IStickyScrollContainerProps =
  | {
      element: ReactElement<{ ref: (element: HTMLElement | null) => void }>;
    }
  | {
      className?: string;
      style?: CSSProperties;
      type?: string;
    };

// A container that supports scrolling with sticky elements.
export const StickyScrollContainer: FC<IStickyScrollContainerProps> = ({
  children,
  ...props
}) => {
  return createElement(
    ScrollContainer,
    props,
    createElement(StickyContainer, {}, children)
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

export interface IStickyProps extends HTMLAttributes<HTMLDivElement> {
  behavior: IStickyBehavior;
  labels?: ILabels;
  respondsTo?: ISelectorFunction;
}

const wrapperStyle = { display: "block", position: "absolute", width: "100%" };
const placeholderStyle = { display: "block", position: "relative" };

export const Sticky: FC<IStickyProps> = memo(
  ({ behavior, children, labels, respondsTo, ...attributes }) => {
    const behaviorState = useRef<any>({});
    const placeholderRef = useRef<HTMLElement>();

    let ref: RefObject<HTMLElement>;
    const handle: IStickyHandle = {
      behavior,
      labels,
      selectorFunction: respondsTo,
      behaviorState: behaviorState.current,
      placeholderRef,
      update: (sticky, stickyCssProps) => {
        const wrapper = ref.current;
        const placeholder = placeholderRef.current;
        if (!wrapper || !placeholder) {
          return;
        }
        const wrapperCssProps: ICssStyleData = {
          ...wrapperStyle,
          ...stickyCssProps
        };
        for (const k of Object.keys(wrapperCssProps)) {
          wrapper.style[k as any] = wrapperCssProps[k];
        }
        placeholder.style.height = wrapper.offsetHeight + "px";
        wrapper.style.width = placeholder.offsetWidth + "px";
      }
    };

    try {
      ref = useGather(handle);
    } catch (e) {
      // We are not running in a scroll container. Just show the content.
      return createElement(Fragment, {}, children);
    }
    return createElement(
      Fragment,
      {},
      createElement(
        "div",
        {
          ref,
          style: typeof window !== "undefined" ? wrapperStyle : undefined,
          ...attributes
        },
        children
      ),
      createElement("div", { ref: placeholderRef, style: placeholderStyle })
    );
  }
);

function isStickyHandle(elem: any): elem is IStickyHandle {
  return "behavior" in elem && typeof elem.update === "function";
}

function calculateRespondsTo(
  handleElements: Array<IGatheredElement<IStickyHandle>>
): number[][] {
  // Evaluate which elements respond to which.
  const allIndexes = [...Array(handleElements.length)].map((_, i) => i);
  return handleElements.map(stickyHandleElement => {
    const { selectorFunction } = stickyHandleElement.data;
    if (selectorFunction) {
      return allIndexes.filter(i =>
        selectorFunction({ labels: handleElements[i].data.labels ?? {} })
      );
    } else {
      return allIndexes;
    }
  });
}

// A container that lays out sticky components and makes sure they are updated properly.
const StickyLayoutContainer: FC<{}> = ({ children }) => {
  const stickyHandleElements = useGatheredElements(isStickyHandle);
  const respondsToIndexes = useMemo(
    () => calculateRespondsTo(stickyHandleElements),
    [stickyHandleElements]
  );

  const scrollElement = useScrollElement();

  const updateLayout = useCallback(
    (eventScrollElement: HTMLElement | Window) => {
      requestAnimationFrame(() => {
        updateStickyLayout(
          stickyHandleElements,
          eventScrollElement,
          respondsToIndexes
        );
      });
    },
    [stickyHandleElements, respondsToIndexes]
  );

  const updateLayoutBound = useCallback(() => {
    if (!scrollElement) {
      return;
    }

    updateLayout(scrollElement);
  }, [updateLayout, scrollElement]);

  useEffect(() => {
    updateLayoutBound();
    return updateLayoutBound;
  }, [updateLayoutBound]);

  useEffect(() => {
    window.addEventListener("resize", updateLayoutBound);
    return () => {
      window.removeEventListener("resize", updateLayoutBound);
    };
  }, [updateLayoutBound]);

  useScrollEvent(
    info => {
      updateLayout(info.scrollElement);
    },
    [updateLayout]
  );
  useResizeEvent(
    info => {
      updateLayout(info.scrollElement);
    },
    [updateLayout]
  );

  return createElement(Fragment, {}, children);
};
