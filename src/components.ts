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
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import {
  ICssStyleData,
  IStickyBehavior,
  IStickyHandle,
  updateStickyLayout,
} from './calc';
import { GatherContainer, useGather, useGatheredElements } from './gather';
import { ScrollContainer, useScrollElement, useScrollEvent } from './scroll';

export type IStickyScrollContainerProps = {
  element: ReactElement<{ ref: (element: HTMLElement | null) => void }>;
} | {
  className?: string;
  style?: CSSProperties;
  type?: string;
};

// A container that supports scrolling with sticky elements.
export const StickyScrollContainer: FC<IStickyScrollContainerProps> = ({ children, ...props }) => {
  return createElement(
    ScrollContainer,
    props,
    createElement(
      StickyContainer,
      {},
      children,
    ),
  );
};

// A container that supports scrolling with sticky elements.
export const StickyContainer: FC<{}> = ({ children }) => {
  return createElement(
    GatherContainer,
    {},
    createElement(StickyLayoutContainer, {}, children),
  );
};

export interface IStickyProps {
  behavior: IStickyBehavior;
}

function isReactElementWithRef(
  elem: any,
): elem is ReactElement<{ ref: Ref<any> }> {
  return 'type' in elem;
}

export const Sticky: FC<IStickyProps> = memo(({ behavior, children }) => {
  const cssProps = useRef<ICssStyleData>({ display: 'none' });
  const stickyCopyRef = useRef<HTMLElement>();
  const behaviorState = useRef<any>({});

  const handle: IStickyHandle = {
    behavior,
    behaviorState: behaviorState.current,
    update: (sticky, stickyCssProps) => {
      (stickyCssProps as any).display = sticky ? 'block' : 'none';
      cssProps.current = stickyCssProps;
      if (stickyCopyRef.current) {
        // Immediately set the style.
        for (const k of Object.keys(stickyCssProps)) {
          stickyCopyRef.current.style[k as any] = stickyCssProps[k];
        }
      }
    },
  };

  const ref = useGather(handle);
  const fixedElement = createElement(
    'div',
    { style: cssProps.current, ref: stickyCopyRef },
    children,
  );

  let haveMappedRef = false;
  const childrenWithRef = Children.map(children, (child) => {
    if (!haveMappedRef && isReactElementWithRef(child)) {
      haveMappedRef = true;
      return cloneElement(child, { ref });
    }
    return child;
  });

  return createElement(Fragment, {}, childrenWithRef, fixedElement);
});

function isStickyHandle(elem: any): elem is IStickyHandle {
  return 'behavior' in elem && typeof elem.update === 'function';
}

// A container that lays out sticky components and makes sure they are updated properly.
const StickyLayoutContainer: FC<{}> = ({ children }) => {
  const stickyHandleElements = useGatheredElements(isStickyHandle);
  const scrollElement = useScrollElement();

  const updateLayout = useCallback(
    (eventScrollElement: HTMLElement | Window) => {
      updateStickyLayout(stickyHandleElements, eventScrollElement);
    },
    [stickyHandleElements],
  );

  useEffect(() => {
    updateLayout(scrollElement);
    return () => {
      updateLayout(scrollElement);
    };
  }, [scrollElement, updateLayout]);

  useScrollEvent(
    (info) => {
      updateLayout(info.scrollElement);
    },
    [updateLayout, updateLayout],
  );

  return createElement(Fragment, {}, children);
};
