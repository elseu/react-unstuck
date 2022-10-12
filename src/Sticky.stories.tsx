import { action } from "@storybook/addon-actions";
import { boolean, select } from "@storybook/addon-knobs";
import { storiesOf } from "@storybook/react";
import React, {
  CSSProperties,
  PropsWithChildren,
  useCallback,
  useRef,
  useState
} from "react";

import {
  ILabels,
  IStickyBehavior,
  notSticky,
  shiftToTop,
  stickToTop,
  stickToTopAndScrollDown,
  stickToTopFullHeight,
  Sticky,
  StickyContainer,
  StickyScrollContainer,
  useStickyLayoutListener,
  useStickyOffsetCalculator
} from "./index";
import { ScrollContext, useScrollElement } from "./scroll";

/* tslint:disable:no-console */

const stories = storiesOf("Sticky", module);

const backgroundColor = "#fff1cf";
const stickyStyle = {
  padding: "10px 0",
  margin: 0,
  color: "#fff"
};
const stickyStyle1 = { ...stickyStyle, backgroundColor: "#015668" };
const stickyStyle2 = { ...stickyStyle, backgroundColor: "#263f44" };
const stickyStyle3 = { ...stickyStyle, backgroundColor: "#ffd369" };
const stickyStyle4 = { ...stickyStyle, backgroundColor: "#015668" };
const stickyStyle5 = { ...stickyStyle, backgroundColor: "#263f44" };

function selectBehavior(label: string, defaultValue: string = "stickToTop") {
  const options = [
    "stickToTop",
    "shiftToTop",
    "stickToTopAndScrollDown",
    "stickToTopFullHeight",
    "notSticky"
  ];
  const option = select(label, options, defaultValue);
  const behaviors: { [k: string]: IStickyBehavior } = {
    stickToTop,
    shiftToTop,
    stickToTopAndScrollDown,
    stickToTopFullHeight,
    notSticky
  };
  return behaviors[option];
}

const logLayoutInfoAction = action("Layout info");

interface IStatefulHeaderProps {
  style?: CSSProperties;
}

const StatefulHeader = React.forwardRef(
  ({ children, style = {} }: PropsWithChildren<IStatefulHeaderProps>, ref) => {
    const [count, setCount] = useState(0);
    const onClick = useCallback(() => {
      setCount(x => x + 1);
    }, []);
    return (
      <h1 onClick={onClick} style={style}>
        {children} ({count})
      </h1>
    );
  }
);

interface IStickyContentProps {
  behavior1: IStickyBehavior;
  behavior2: IStickyBehavior;
  behavior3: IStickyBehavior;
  behavior4: IStickyBehavior;
  behavior5: IStickyBehavior;
  logLayoutInfo: boolean;
}

function fullWidth({ labels }: { labels: ILabels }) {
  return !!labels.fullWidth;
}

const StickyContent = ({
  behavior1,
  behavior2,
  behavior3,
  behavior4,
  behavior5,
  logLayoutInfo
}: IStickyContentProps) => {
  const firstScrollTargetRef = useRef(null);
  const secondScrollTargetRef = useRef(null);

  const { scrollTopForElement } = useStickyOffsetCalculator();

  const scrollElement = useScrollElement();

  // Demo the sticky offset calculator.
  const scrollToElement = useCallback(
    (element: HTMLElement | null) => {
      if (element === null || scrollElement === null) {
        return;
      }
      scrollElement?.scrollTo(0, scrollTopForElement(element));
    },
    [scrollElement, scrollTopForElement]
  );

  useStickyLayoutListener(
    ({ getStickyLayoutInfo }) => {
      if (logLayoutInfo) {
        logLayoutInfoAction({
          all: getStickyLayoutInfo(),
          fullWidth: getStickyLayoutInfo(fullWidth)
        });
      }
    },
    [logLayoutInfo]
  );
  return (
    <>
      <h1 style={stickyStyle1}>Nonsticky</h1>
      <button onClick={() => scrollToElement(firstScrollTargetRef.current)}>
        Scroll to first
      </button>
      <button onClick={() => scrollToElement(secondScrollTargetRef.current)}>
        Scroll to second
      </button>
      {[...Array(10)]
        .map((_, i) => i)
        .map(i => (
          <p key={`bla-${i}`}>{`bla-${i}`}</p>
        ))}
      <Sticky behavior={behavior1} labels={{ fullWidth: true }}>
        <StatefulHeader style={stickyStyle1}>First</StatefulHeader>
      </Sticky>
      {[...Array(10)]
        .map((_, i) => i)
        .map(i => (
          <p key={`first-${i}`}>{`first-${i}`}</p>
        ))}
      <Sticky behavior={behavior2} labels={{ fullWidth: true }}>
        <h1 style={stickyStyle2}>
          Second
          <br />
          <span ref={firstScrollTargetRef}>First scroll target</span>
        </h1>
      </Sticky>
      {[...Array(10)]
        .map((_, i) => i)
        .map(i => (
          <p key={`second-${i}`}>{`second-${i}`}</p>
        ))}
      <p>First scroll target</p>
      {[...Array(10)]
        .map((_, i) => i + 10)
        .map(i => (
          <p key={`second-${i}`}>{`second-${i}`}</p>
        ))}
      <Sticky behavior={behavior3} labels={{ fullWidth: true }}>
        <h1 style={stickyStyle3}>
          Third with a really really really really really really long title
        </h1>
      </Sticky>
      {[...Array(40)]
        .map((_, i) => i)
        .map(i => (
          <p key={`third-${i}`}>{`third-${i}`}</p>
        ))}
      <div style={{ clear: "both", overflow: "hidden" }}>
        <div style={{ float: "left", width: "20%" }}>
          {[...Array(30)]
            .map((_, i) => i)
            .map(i => (
              <p key={`fourth-left-${i}`}>{`fourth-left-${i}`}</p>
            ))}
          <Sticky behavior={behavior4} respondsTo={fullWidth}>
            <h1 style={stickyStyle4}>Fourth left</h1>
          </Sticky>
          {[...Array(20)]
            .map((_, i) => i)
            .map(i => (
              <p key={`fourth-left-${i}`}>{`fourth-left-${i}`}</p>
            ))}
        </div>
        <div style={{ float: "left", width: "60%" }}>
          <Sticky behavior={behavior4} respondsTo={fullWidth}>
            <h1 style={stickyStyle4}>Fourth</h1>
          </Sticky>
          {[...Array(10)]
            .map((_, i) => i)
            .map(i => (
              <p key={`fourth-${i}`}>{`fourth-${i}`}</p>
            ))}
          <p ref={secondScrollTargetRef}>Second scroll target</p>
          {[...Array(10)]
            .map((_, i) => i + 10)
            .map(i => (
              <p key={`fourth-${i}`}>{`fourth-${i}`}</p>
            ))}
        </div>
        <div style={{ float: "left", width: "20%" }}>
          {[...Array(20)]
            .map((_, i) => i)
            .map(i => (
              <p key={`fourth-right-${i}`}>{`fourth-right-${i}`}</p>
            ))}
          <Sticky behavior={behavior4} respondsTo={fullWidth}>
            <h1 style={stickyStyle4}>Fourth right</h1>
          </Sticky>
          {[...Array(20)]
            .map((_, i) => i)
            .map(i => (
              <p key={`fourth-right-${i}`}>{`fourth-right-${i}`}</p>
            ))}
        </div>
      </div>
      <Sticky behavior={behavior5} labels={{ fullWidth: true }}>
        <h1 style={stickyStyle5}>Fifth</h1>
      </Sticky>
      {[...Array(20)]
        .map((_, i) => i)
        .map(i => (
          <p key={`fifth-${i}`}>{`fifth-${i}`}</p>
        ))}
    </>
  );
};

stories.add("In overflow container", () => {
  const behavior1 = selectBehavior("Behavior 1");
  const behavior2 = selectBehavior("Behavior 2");
  const behavior3 = selectBehavior("Behavior 3");
  const behavior4 = selectBehavior("Behavior 4");
  const behavior5 = selectBehavior("Behavior 5");
  const logLayoutInfo = boolean("Log layout info with listener", false);

  return (
    <div style={{ paddingTop: "50px" }}>
      <StickyScrollContainer
        style={{
          height: "300px",
          backgroundColor
        }}
      >
        <StickyContent
          behavior1={behavior1}
          behavior2={behavior2}
          behavior3={behavior3}
          behavior4={behavior4}
          behavior5={behavior5}
          logLayoutInfo={logLayoutInfo}
        />
      </StickyScrollContainer>
    </div>
  );
});

stories.add("In window", () => {
  const behavior1 = selectBehavior("Behavior 1");
  const behavior2 = selectBehavior("Behavior 2");
  const behavior3 = selectBehavior("Behavior 3");
  const behavior4 = selectBehavior("Behavior 4");
  const behavior5 = selectBehavior("Behavior 5");
  const logLayoutInfo = boolean("Log layout info with listener", false);

  return (
    <StickyContainer>
      <StickyContent
        behavior1={behavior1}
        behavior2={behavior2}
        behavior3={behavior3}
        behavior4={behavior4}
        behavior5={behavior5}
        logLayoutInfo={logLayoutInfo}
      />
    </StickyContainer>
  );
});

const fullHeightStyle = {
  backgroundColor: "#263f44",
  borderBottom: "2px solid yellow",
  height: "100%"
};

const FullHeightStickyContent = ({
  behavior,
  logLayoutInfo
}: {
  behavior: IStickyBehavior;
  logLayoutInfo: boolean;
}) => {
  useStickyLayoutListener(
    ({ getStickyLayoutInfo }) => {
      if (logLayoutInfo) {
        logLayoutInfoAction(getStickyLayoutInfo());
      }
    },
    [logLayoutInfo]
  );
  return (
    <>
      {[...Array(20)]
        .map((_, i) => i)
        .map(i => (
          <p key={`first-${i}`}>{`first-${i}`}</p>
        ))}
      <Sticky behavior={behavior}>
        <h1 style={stickyStyle1}>
          This sticks to top and is a pretty long title
        </h1>
      </Sticky>
      {[...Array(40)]
        .map((_, i) => i)
        .map(i => (
          <p key={`second-${i}`}>{`second-${i}`}</p>
        ))}
      <div style={{ clear: "both", overflow: "hidden" }}>
        <div style={{ float: "left", width: "40%" }}>
          <Sticky behavior={stickToTopFullHeight}>
            <div style={fullHeightStyle}>This is full height</div>
          </Sticky>
        </div>
        <div style={{ float: "left", width: "60%" }}>
          {[...Array(20)]
            .map((_, i) => i)
            .map(i => (
              <p key={`fourth-left-${i}`}>{`fourth-left-${i}`}</p>
            ))}
        </div>
      </div>
    </>
  );
};

stories.add("Full height", () => {
  const behavior = selectBehavior("Behavior");
  const logLayoutInfo = boolean("Log layout info with listener", false);

  return (
    <StickyContainer>
      <FullHeightStickyContent
        behavior={behavior}
        logLayoutInfo={logLayoutInfo}
      />
    </StickyContainer>
  );
});

stories.add("Test SSR", () => {
  const behavior = selectBehavior("Behavior");
  const logLayoutInfo = boolean("Log layout info with listener", false);

  return (
    <ScrollContext.Provider value={{ scrollElement: null }}>
      <FullHeightStickyContent
        behavior={behavior}
        logLayoutInfo={logLayoutInfo}
      />
    </ScrollContext.Provider>
  );
});
