import { action } from "@storybook/addon-actions";
import { Meta, Story } from "@storybook/react";
import React, {
  ComponentPropsWithoutRef,
  CSSProperties,
  FC,
  forwardRef,
  PropsWithChildren,
  useCallback,
  useRef,
  useState,
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
  StickyConfigProvider,
  StickyContainer,
  StickyScrollContainer,
  useStickyLayoutListener,
  useStickyOffsetCalculator,
} from "./index";
import { ScrollContext, useScrollElement } from "./scroll";

// tslint:disable-next-line:no-object-literal-type-assertion
export default {
  title: "Sticky",
  component: Sticky,
  subcomponents: { StickyContainer, StickyScrollContainer },
} as Meta<any>;
/* tslint:disable:no-console */

const backgroundColor = "#fff1cf";
const stickyStyle = {
  padding: "10px 0",
  margin: 0,
  color: "#fff",
};
const stickyStyle1 = { ...stickyStyle, backgroundColor: "#015668" };
const stickyStyle2 = { ...stickyStyle, backgroundColor: "#263f44" };
const stickyStyle3 = { ...stickyStyle, backgroundColor: "#ffd369" };
const stickyStyle4 = { ...stickyStyle, backgroundColor: "#015668" };
const stickyStyle5 = { ...stickyStyle, backgroundColor: "#263f44" };

function behaviorControl(label: string, defaultValue: string = "stickToTop") {
  return {
    name: label,
    defaultValue,
    options: [
      "stickToTop",
      "shiftToTop",
      "stickToTopAndScrollDown",
      "stickToTopFullHeight",
      "notSticky",
    ],
    control: {
      type: "select",
      defaultValue,
    },
    mapping: {
      stickToTop,
      shiftToTop,
      stickToTopAndScrollDown,
      stickToTopFullHeight,
      notSticky,
    },
  };
}

const logLayoutInfoAction = action("Layout info");

interface IStatefulHeaderProps {
  style?: CSSProperties;
}

const StatefulHeader: FC<PropsWithChildren<IStatefulHeaderProps>> =
  React.forwardRef(({ children, style = {} }, ref) => {
    const [count, setCount] = useState(0);
    const onClick = useCallback(() => {
      setCount((x) => x + 1);
    }, []);
    return (
      <h1 onClick={onClick} style={style}>
        {children} ({count})
      </h1>
    );
  });

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

const StickyContent: FC<IStickyContentProps> = ({
  behavior1,
  behavior2,
  behavior3,
  behavior4,
  behavior5,
  logLayoutInfo,
}) => {
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
          fullWidth: getStickyLayoutInfo(fullWidth),
        });
      }
    },
    [logLayoutInfo]
  );
  return (
    <StickyConfigProvider baseZIndex={500}>
      <h1 style={stickyStyle1}>Nonsticky</h1>
      {/* tslint:disable-next-line:jsx-no-lambda */}
      <button onClick={() => scrollToElement(firstScrollTargetRef.current)}>
        Scroll to first
      </button>
      {/* tslint:disable-next-line:jsx-no-lambda */}
      <button onClick={() => scrollToElement(secondScrollTargetRef.current)}>
        Scroll to second
      </button>
      {[...Array(10)]
        .map((_, i) => i)
        .map((i) => (
          <p key={`bla-${i}`}>{`bla-${i}`}</p>
        ))}
      <Sticky behavior={behavior1} labels={{ fullWidth: true }}>
        <StatefulHeader style={stickyStyle1}>First</StatefulHeader>
      </Sticky>
      {[...Array(10)]
        .map((_, i) => i)
        .map((i) => (
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
        .map((i) => (
          <p key={`second-${i}`}>{`second-${i}`}</p>
        ))}
      <p>First scroll target</p>
      {[...Array(10)]
        .map((_, i) => i + 10)
        .map((i) => (
          <p key={`second-${i}`}>{`second-${i}`}</p>
        ))}
      <Sticky behavior={behavior3} labels={{ fullWidth: true }}>
        <h1 style={stickyStyle3}>
          Third with a really really really really really really long title
        </h1>
      </Sticky>
      {[...Array(40)]
        .map((_, i) => i)
        .map((i) => (
          <p key={`third-${i}`}>{`third-${i}`}</p>
        ))}
      <div style={{ clear: "both", overflow: "hidden" }}>
        <div style={{ float: "left", width: "20%" }}>
          {[...Array(30)]
            .map((_, i) => i)
            .map((i) => (
              <p key={`fourth-left-${i}`}>{`fourth-left-${i}`}</p>
            ))}
          <Sticky behavior={behavior4} respondsTo={fullWidth}>
            <h1 style={stickyStyle4}>Fourth left</h1>
          </Sticky>
          {[...Array(20)]
            .map((_, i) => i)
            .map((i) => (
              <p key={`fourth-left-${i}`}>{`fourth-left-${i}`}</p>
            ))}
        </div>
        <div style={{ float: "left", width: "60%" }}>
          <Sticky behavior={behavior4} respondsTo={fullWidth}>
            <h1 style={stickyStyle4}>Fourth</h1>
          </Sticky>
          {[...Array(10)]
            .map((_, i) => i)
            .map((i) => (
              <p key={`fourth-${i}`}>{`fourth-${i}`}</p>
            ))}
          <p ref={secondScrollTargetRef}>Second scroll target</p>
          {[...Array(10)]
            .map((_, i) => i + 10)
            .map((i) => (
              <p key={`fourth-${i}`}>{`fourth-${i}`}</p>
            ))}
        </div>
        <div style={{ float: "left", width: "20%" }}>
          {[...Array(20)]
            .map((_, i) => i)
            .map((i) => (
              <p key={`fourth-right-${i}`}>{`fourth-right-${i}`}</p>
            ))}
          <Sticky behavior={behavior4} respondsTo={fullWidth}>
            <h1 style={stickyStyle4}>Fourth right</h1>
          </Sticky>
          {[...Array(20)]
            .map((_, i) => i)
            .map((i) => (
              <p key={`fourth-right-${i}`}>{`fourth-right-${i}`}</p>
            ))}
        </div>
      </div>
      <Sticky behavior={behavior5} labels={{ fullWidth: true }}>
        <h1 style={stickyStyle5}>Fifth</h1>
      </Sticky>
      {[...Array(20)]
        .map((_, i) => i)
        .map((i) => (
          <p key={`fifth-${i}`}>{`fifth-${i}`}</p>
        ))}
    </StickyConfigProvider>
  );
};

export const RemountLongContent: Story = () => {
  const [key, setKey] = useState(Math.floor(Math.random() * 100));
  const lipsum = Array(2000)
    .fill(0)
    .map(
      () =>
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent lacinia ullamcorper porta. Sed nisl nisl, semper vel lectus ac, aliquet varius lacus. Pellentesque vitae eleifend velit. Cras non elit a felis egestas placerat at ac felis. Nulla gravida quam sed pulvinar malesuada. Curabitur dignissim accumsan nunc, id condimentum nulla accumsan in. In felis libero, tempus non lacus in, vehicula imperdiet arcu. Phasellus mattis feugiat dolor ac fermentum. Nulla porta, sem eu tristique facilisis, nibh ante aliquam lorem, non cursus nulla ipsum et libero. Phasellus iaculis, magna quis cursus condimentum, metus arcu hendrerit erat, ut porta tortor turpis id velit. Etiam interdum blandit mauris, et imperdiet sapien rhoncus et. Quisque pretium ex ac quam varius, eget auctor justo rhoncus. Etiam sit amet sem eros. Vestibulum aliquet scelerisque metus sit amet sagittis. Fusce quis porta massa, at blandit magna. Sed ac magna sit amet nunc egestas ornare ut nec felis."
    );
  return (
    <>
      <button
        type="button"
        onClick={() => setKey(Math.floor(Math.random() * 100))}
      >
        set random key
      </button>
      <StickyContainer key={key}>
        <div style={{ width: "500px" }}>
          <div
            style={{ width: "100%", height: 100, backgroundColor: "lightgray" }}
          />
          <Sticky behavior={stickToTop}>
            <div
              style={{
                width: "100%",
                height: 100,
                backgroundColor: "red",
                overflow: "hidden",
              }}
            >
              <h1>I am sticky</h1>
              {lipsum}
            </div>
          </Sticky>
          <div
            style={{ width: "100%", height: 100, backgroundColor: "black" }}
          />
          <div style={{ width: "100%", backgroundColor: "white" }}>
            {lipsum}
          </div>
        </div>
      </StickyContainer>
    </>
  );
};

export const InOverflowContainer: Story<IStickyContentProps> = ({
  behavior1,
  behavior2,
  behavior3,
  behavior4,
  behavior5,
  logLayoutInfo,
}) => {
  return (
    <div style={{ paddingTop: "50px" }}>
      <StickyScrollContainer
        style={{
          height: "300px",
          backgroundColor,
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
};

export const InWindow: Story<IStickyContentProps> = ({
  behavior1,
  behavior2,
  behavior3,
  behavior4,
  behavior5,
  logLayoutInfo,
}) => {
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
};

InOverflowContainer.argTypes = {
  behavior1: behaviorControl("Behavior 1"),
  behavior2: behaviorControl("Behavior 2"),
  behavior3: behaviorControl("Behavior 3"),
  behavior4: behaviorControl("Behavior 4"),
  behavior5: behaviorControl("Behavior 5"),
  logLayoutInfo: {
    name: "Log layout info with listener",
    type: "boolean",
  },
};

const fullHeightStyle = {
  backgroundColor: "#263f44",
  borderBottom: "2px solid yellow",
  height: "100%",
};

const FullHeightStickyContent: FC<{
  behavior: IStickyBehavior;
  logLayoutInfo: boolean;
}> = ({ behavior, logLayoutInfo }) => {
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
        .map((i) => (
          <p key={`first-${i}`}>{`first-${i}`}</p>
        ))}
      <Sticky behavior={behavior}>
        <h1 style={stickyStyle1}>
          This sticks to top and is a pretty long title
        </h1>
      </Sticky>
      {[...Array(40)]
        .map((_, i) => i)
        .map((i) => (
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
            .map((i) => (
              <p key={`fourth-left-${i}`}>{`fourth-left-${i}`}</p>
            ))}
        </div>
      </div>
    </>
  );
};

InWindow.argTypes = {
  behavior1: behaviorControl("Behavior 1"),
  behavior2: behaviorControl("Behavior 2"),
  behavior3: behaviorControl("Behavior 3"),
  behavior4: behaviorControl("Behavior 4"),
  behavior5: behaviorControl("Behavior 5"),
  logLayoutInfo: {
    name: "Log layout info with listener",
    type: "boolean",
  },
};

export const FullHeight: Story<{
  behavior: IStickyBehavior;
  logLayoutInfo: boolean;
}> = ({ behavior, logLayoutInfo }) => {
  return (
    <StickyContainer>
      <FullHeightStickyContent
        behavior={behavior}
        logLayoutInfo={logLayoutInfo}
      />
    </StickyContainer>
  );
};

FullHeight.argTypes = {
  behavior: behaviorControl("Behavior"),
  logLayoutInfo: {
    name: "Log layout info with listener",
    type: "boolean",
  },
};

export const TestSSR: Story<{
  behavior: IStickyBehavior;
  logLayoutInfo: boolean;
}> = ({ behavior, logLayoutInfo }) => {
  return (
    <ScrollContext.Provider value={{ scrollElement: null }}>
      <FullHeightStickyContent
        behavior={behavior}
        logLayoutInfo={logLayoutInfo}
      />
    </ScrollContext.Provider>
  );
};

TestSSR.argTypes = {
  behavior: behaviorControl("Behavior"),
  logLayoutInfo: {
    name: "Log layout info with listener",
    type: "boolean",
  },
};

const PositionAbsoluteContainerComponent = forwardRef<
  HTMLDivElement,
  PropsWithChildren<ComponentPropsWithoutRef<"div">>
>(({ children, ...other }, ref) => {
  return (
    <div
      ref={ref}
      style={{
        height: "100vh",
        position: "absolute",
        overflow: "auto",
        width: 720,
        top: 0,
        right: 0,
      }}
      {...other}
    >
      {children}
    </div>
  );
});

export const PositionAbsoluteContainer: Story<IStickyContentProps> = ({
  behavior1,
  behavior2,
  behavior3,
  behavior4,
  behavior5,
  logLayoutInfo,
}) => {
  return (
    <StickyScrollContainer element={<PositionAbsoluteContainerComponent />}>
      <StickyContent
        behavior1={behavior1}
        behavior2={behavior2}
        behavior3={behavior3}
        behavior4={behavior4}
        behavior5={behavior5}
        logLayoutInfo={logLayoutInfo}
      />
    </StickyScrollContainer>
  );
};

PositionAbsoluteContainer.argTypes = {
  behavior1: behaviorControl("Behavior 1"),
  behavior2: behaviorControl("Behavior 2"),
  behavior3: behaviorControl("Behavior 3"),
  behavior4: behaviorControl("Behavior 4"),
  behavior5: behaviorControl("Behavior 5"),
  logLayoutInfo: {
    name: "Log layout info with listener",
    type: "boolean",
  },
};
