import { select } from "@storybook/addon-knobs";
import { storiesOf } from "@storybook/react";
import React, { CSSProperties, useCallback, useState } from "react";

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
  StickyScrollContainer
} from "./index";
import { ScrollContext } from "./scroll";

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

interface IStatefulHeaderProps {
  style?: CSSProperties;
}

const StatefulHeader: React.FC<IStatefulHeaderProps> = React.forwardRef(
  ({ children, style = {} }, ref) => {
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
}

function fullWidth({ labels }: { labels: ILabels }) {
  return !!labels.fullWidth;
}

const StickyContent: React.FC<IStickyContentProps> = ({
  behavior1,
  behavior2,
  behavior3,
  behavior4,
  behavior5
}) => {
  return (
    <>
      <h1 style={stickyStyle1}>Nonsticky</h1>
      {[...Array(10)]
        .map((_, i) => i)
        .map(i => (
          <p key={`bla-${i}`}>{`bla-${i}`}</p>
        ))}
      <Sticky behavior={behavior1}>
        <StatefulHeader style={stickyStyle1}>First</StatefulHeader>
      </Sticky>
      {[...Array(10)]
        .map((_, i) => i)
        .map(i => (
          <p key={`first-${i}`}>{`first-${i}`}</p>
        ))}
      <Sticky behavior={behavior2}>
        <h1 style={stickyStyle2}>Second</h1>
      </Sticky>
      {[...Array(20)]
        .map((_, i) => i)
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
          {[...Array(20)]
            .map((_, i) => i)
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

  return (
    <StickyContainer>
      <StickyContent
        behavior1={behavior1}
        behavior2={behavior2}
        behavior3={behavior3}
        behavior4={behavior4}
        behavior5={behavior5}
      />
    </StickyContainer>
  );
});

const fullHeightStyle = {
  backgroundColor: "#263f44",
  borderBottom: "2px solid yellow",
  height: "100%"
};

const FullHeightStickyContent: React.FC<{ behavior: IStickyBehavior }> = ({
  behavior
}) => {
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

  return (
    <StickyContainer>
      <FullHeightStickyContent behavior={behavior} />
    </StickyContainer>
  );
});

stories.add("Test SSR", () => {
  const behavior = selectBehavior("Behavior");

  return (
    <ScrollContext.Provider value={{ scrollElement: null }}>
      <FullHeightStickyContent behavior={behavior} />
    </ScrollContext.Provider>
  );
});
