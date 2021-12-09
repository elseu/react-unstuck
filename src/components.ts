import {
  createContext,
  createElement,
  CSSProperties,
  FC,
  Fragment,
  HTMLAttributes,
  memo,
  ReactElement,
  RefObject,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef
} from "react";
import {
  ICssStyleData,
  IProcessedStickyLayout,
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
  defaultZIndex?: number;
  behavior: IStickyBehavior;
  labels?: ILabels;
  respondsTo?: ISelectorFunction;
}

const wrapperStyle = { display: "block", position: "absolute", width: "100%" };
const placeholderStyle = { display: "block", position: "relative" };

export const Sticky: FC<IStickyProps> = memo(
  ({
    behavior,
    children,
    labels,
    respondsTo,
    defaultZIndex,
    ...attributes
  }) => {
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
          ...stickyCssProps,
          ...(!sticky &&
            defaultZIndex !== undefined && {
              zIndex: defaultZIndex
            })
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

interface IStickyLayoutInfo {
  hasStickyLayout: boolean;
  bottom: number;
}

interface IStickyLayoutUpdateEvent {
  getStickyLayoutInfo(selector?: ISelectorFunction): IStickyLayoutInfo;
}

interface IStickyLayoutContext {
  listeners: Array<(event: IStickyLayoutUpdateEvent) => void>;
  getStickyLayoutInfo(selector?: ISelectorFunction): IStickyLayoutInfo;
}

const StickyLayoutContext = createContext<IStickyLayoutContext | null>(null);

function useStickyLayoutContext(): IStickyLayoutContext {
  const stickyLayoutContext = useContext(StickyLayoutContext);
  if (stickyLayoutContext === null) {
    throw new Error(
      "You should only use sticky-related hooks inside a StickyContainer or StickyScrollContainer"
    );
  }
  return stickyLayoutContext;
}

const StickyLayoutContainer: FC<{}> = ({ children }) => {
  const stickyLayoutContextRef = useRef({
    listeners: [],
    getStickyLayoutInfo: () => ({ hasStickyLayout: false, bottom: 0 })
  } as IStickyLayoutContext);
  return createElement(
    StickyLayoutContext.Provider,
    { value: stickyLayoutContextRef.current },
    createElement(StickyLayoutInnerContainer, {}, children)
  );
};

// A container that lays out sticky components and makes sure they are updated properly.
const StickyLayoutInnerContainer: FC<{}> = ({ children }) => {
  const stickyLayoutContext = useStickyLayoutContext();

  const stickyHandleElements = useGatheredElements(isStickyHandle);
  const respondsToIndexes = useMemo(
    () => calculateRespondsTo(stickyHandleElements),
    [stickyHandleElements]
  );

  const scrollElement = useScrollElement();

  const stickyLayoutsRef = useRef<IProcessedStickyLayout[]>([]);

  stickyLayoutContext.getStickyLayoutInfo = useCallback(
    (selector: ISelectorFunction) => {
      const stickyLayouts = stickyLayoutsRef.current;
      let hasStickyLayout = false;
      let bottom = 0;
      for (let i = 0; i < stickyLayouts.length; i++) {
        const stickyLayout = stickyLayouts[i];
        if (stickyLayout === null) {
          continue;
        }
        if (selector) {
          const labels = stickyHandleElements[i].data.labels ?? {};
          if (!selector({ labels })) {
            continue;
          }
        }
        hasStickyLayout = true;
        bottom = stickyLayout.bottom;
      }

      return {
        hasStickyLayout,
        bottom
      };
    },
    [stickyHandleElements, stickyLayoutsRef]
  );

  const updateLayout = useCallback(
    (eventScrollElement: HTMLElement | Window) => {
      requestAnimationFrame(() => {
        stickyLayoutsRef.current = updateStickyLayout(
          stickyHandleElements,
          eventScrollElement,
          respondsToIndexes
        );
        const { listeners } = stickyLayoutContext;
        if (listeners.length > 0) {
          const event: IStickyLayoutUpdateEvent = {
            getStickyLayoutInfo: stickyLayoutContext.getStickyLayoutInfo
          };
          listeners.forEach(l => l(event));
        }
      });
    },
    [stickyHandleElements, respondsToIndexes, stickyLayoutContext]
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
export function useStickyLayoutListener(
  listener: (event: IStickyLayoutUpdateEvent) => void,
  deps: any[]
): void {
  const stickyLayoutContext = useStickyLayoutContext();
  const listenerRef = useRef(listener);
  useEffect(
    () => {
      // Add the listener.
      listenerRef.current = listener;
      stickyLayoutContext.listeners.push(listener);
      return () => {
        // Remove the listener.
        stickyLayoutContext.listeners = stickyLayoutContext.listeners.filter(
          l => l !== listenerRef.current
        );
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps
  );
}

// A hook that lets us fetch the current sticky layout info.
export function useStickyLayoutInfo(): () => IStickyLayoutInfo {
  return useStickyLayoutContext().getStickyLayoutInfo;
}
