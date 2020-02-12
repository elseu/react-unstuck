import {
  cloneElement,
  createContext,
  createElement,
  CSSProperties,
  FC,
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

interface IScrollContext {
  scrollElement: HTMLElement | Window;
}

const defaultScrollContext: IScrollContext = {
  scrollElement: window
};

const ScrollContext = createContext(defaultScrollContext);

export type IScrollContainerProps =
  | {
      element: ReactElement<{ ref: (element: HTMLElement | null) => void }>;
    }
  | {
      className?: string;
      style?: CSSProperties;
      type?: string;
    };

const defaultScrollStyle = { position: "relative", overflowY: "scroll" };

export const ScrollContainer: FC<IScrollContainerProps> = props => {
  const [scrollElement, setScrollElement] = useState<HTMLElement | null>(null);
  const ref = useCallback(
    (element: HTMLElement | null) => {
      setScrollElement(element);
    },
    [setScrollElement]
  );

  const { children } = props;
  let elementWithRef:
    | ReactElement<{ ref: (element: HTMLElement | null) => void }>
    | undefined;
  if ("element" in props) {
    elementWithRef = cloneElement(props.element, { ref }, children);
  } else {
    const { className, style, type = "div" } = props;
    elementWithRef = createElement(
      type,
      { className, style: { ...defaultScrollStyle, ...style }, ref },
      children
    );
  }

  const context: IScrollContext = useMemo(
    () => ({
      scrollElement: scrollElement || defaultScrollContext.scrollElement
    }),
    [scrollElement]
  );

  return createElement(
    ScrollContext.Provider,
    { value: context },
    elementWithRef
  );
};

export interface IScrollEventInfo {
  scrollElement: HTMLElement | Window;
  event: Event;
}

export interface IResizeEventInfo {
  scrollElement: HTMLElement | Window;
  event: Event;
}

export function useScrollElement(): HTMLElement | Window {
  return useContext(ScrollContext).scrollElement;
}

export function useScrollEvent(
  f: (info: IScrollEventInfo) => void,
  deps: any[]
): void {
  const { scrollElement } = useContext(ScrollContext);
  const callbackF = useCallback(f, deps);
  const onScroll = useCallback(
    (event: Event) => {
      callbackF({
        scrollElement,
        event
      });
    },
    [scrollElement, callbackF]
  );
  useEffect(() => {
    scrollElement.addEventListener("scroll", onScroll);
    return () => {
      scrollElement.removeEventListener("scroll", onScroll);
    };
  }, [scrollElement, onScroll]);
}

export function useResizeEvent(
  f: (info: IResizeEventInfo) => void,
  deps: any[]
): void {
  const { scrollElement } = useContext(ScrollContext);
  const callbackF = useCallback(f, deps);
  const onResize = useCallback(
    (event: Event) => {
      callbackF({
        scrollElement,
        event
      });
    },
    [scrollElement, callbackF]
  );
  useEffect(() => {
    window.top.addEventListener("resize", onResize);
    return () => {
      window.top.removeEventListener("resize", onResize);
    };
  }, [onResize]);
}
