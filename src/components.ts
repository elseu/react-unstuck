import {
  Children,
  cloneElement,
  createElement,
  CSSProperties,
  FC,
  Fragment,
  memo,
  ReactElement,
  Ref,
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";
import {
  ICssStyleData,
  IStickyBehavior,
  IStickyHandle,
  updateStickyLayout
} from "./calc";
import { GatherContainer, useGather, useGatheredElements } from "./gather";
import { ScrollContainer, useScrollElement, useScrollEvent } from "./scroll";

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

export interface IStickyProps {
  behavior: IStickyBehavior;
  strategy?: "placeholder" | "render";
}

function isReactElementWithRef(
  elem: any
): elem is ReactElement<{ ref: Ref<any> }> {
  return "type" in elem;
}

export const Sticky: FC<IStickyProps> = memo(
  ({ behavior, strategy = "render", children }) => {
    const [enablePlaceholder, setEnablePlaceholder] = useState(false);
    const fixedCssProps = useRef<ICssStyleData>({ display: "none" });
    const placeholderCssProps = useRef<ICssStyleData>({ display: "block" });
    const stickyCopyRef = useRef<HTMLElement>();
    const placeholderHeightRef = useRef<number>(0);
    const behaviorState = useRef<any>({});

    const handle: IStickyHandle = {
      behavior,
      behaviorState: behaviorState.current,
      update: (sticky, stickyCssProps) => {
        (stickyCssProps as any).display = sticky ? "block" : "none";
        fixedCssProps.current = stickyCssProps;
        const stickyCopyNode = stickyCopyRef.current;
        const refNode = ref.current as HTMLElement;
        if (!stickyCopyNode || !refNode) {
          return;
        }
        // Immediately set the style.
        for (const k of Object.keys(stickyCssProps)) {
          stickyCopyNode.style[k as any] = stickyCssProps[k];
        }
        if (strategy === "placeholder") {
          if (!sticky && refNode.offsetHeight > 0) {
            placeholderHeightRef.current = refNode.offsetHeight;
          }
          if (sticky) {
            // Set the placeholder height if the placeholder is visible.
            const height =
              stickyCopyNode.offsetHeight > 0
                ? stickyCopyNode.offsetHeight
                : placeholderHeightRef.current;
            if (height > 0) {
              refNode.style.height = placeholderCssProps.current.height =
                height + "px";
            }
          }
          setEnablePlaceholder(sticky);
        }
      }
    };

    let ref: RefObject<any>;
    try {
      ref = useGather(handle);
    } catch (e) {
      // We are not running in a scroll container. Just show the content.
      return createElement(Fragment, {}, children);
    }
    const fixedElement = createElement(
      "div",
      {
        ref: stickyCopyRef,
        style: { ...fixedCssProps.current }
      },
      strategy === "render" || enablePlaceholder ? children : null
    );

    let haveMappedRef = false;
    const childrenWithRef = Children.map(children, child => {
      if (!haveMappedRef && isReactElementWithRef(child)) {
        haveMappedRef = true;
        if (strategy === "placeholder") {
          // Show a placeholder instead and use its coordinates.
          const currentPlaceholderCssProps = { ...placeholderCssProps.current };
          if (!enablePlaceholder) {
            delete currentPlaceholderCssProps.height;
          }

          return createElement(
            "div",
            {
              ref,
              style: currentPlaceholderCssProps
            },
            enablePlaceholder ? null : child
          );
        } else {
          return cloneElement(child, { ref });
        }
      }
      return child;
    });

    return createElement(Fragment, {}, childrenWithRef, fixedElement);
  }
);

function isStickyHandle(elem: any): elem is IStickyHandle {
  return "behavior" in elem && typeof elem.update === "function";
}

// A container that lays out sticky components and makes sure they are updated properly.
const StickyLayoutContainer: FC<{}> = ({ children }) => {
  const stickyHandleElements = useGatheredElements(isStickyHandle);
  const scrollElement = useScrollElement();

  const updateLayout = useCallback(
    (eventScrollElement: HTMLElement | Window) => {
      requestAnimationFrame(() => {
        updateStickyLayout(stickyHandleElements, eventScrollElement);
      });
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
