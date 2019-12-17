import { number, select } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';
import React, { useMemo, useState, useCallback, CSSProperties, forwardRef } from 'react';

import {
  shiftToTop,
  stickToTop,
  stickToTopAndScrollDown,
  Sticky,
  StickyContainer,
  StickyScrollContainer,
} from 'index';

/* tslint:disable:no-console */

import { IStickyBehavior } from 'calc';
import '../.storybook/global.css';

const stories = storiesOf('Sticky', module);

const backgroundColor = '#fff1cf';
const stickyStyle = {
  padding: '10px 0',
  margin: 0,
  color: '#fff',
};
const stickyStyle1 = { ...stickyStyle, backgroundColor: '#015668' };
const stickyStyle2 = { ...stickyStyle, backgroundColor: '#263f44' };
const stickyStyle3 = { ...stickyStyle, backgroundColor: '#ffd369' };

function selectBehavior(label: string, defaultValue: string = 'stickToTop') {
  const options = ['stickToTop', 'shiftToTop', 'stickToTopAndScrollDown'];
  const option = select(label, options, defaultValue);
  const behaviors: { [k: string]: IStickyBehavior } = {
    stickToTop,
    shiftToTop,
    stickToTopAndScrollDown,
  };
  return behaviors[option];
}

interface IHeightChangingHeaderProps {
  style?: CSSProperties;
  behavior: IStickyBehavior;
}

const HeightChangingHeader: React.FC<IHeightChangingHeaderProps> = ({ children, behavior, style = {} }) => {
  const [higher, setHigher] = useState(false);
  const onClick = useCallback(() => {
    setHigher((x) => !x);
  }, [setHigher]);
  return (
    <Sticky behavior={behavior}>
      <h1 onClick={onClick} style={{ ...style, padding: higher ? '40px 0' : '10px 0' }}>{children}</h1>
    </Sticky>
  );
};

interface IStickyContentProps {
  behavior1: IStickyBehavior;
  behavior2: IStickyBehavior;
  behavior3: IStickyBehavior;
}

const StickyContent: React.FC<IStickyContentProps> = ({
  behavior1,
  behavior2,
  behavior3,
}) => {
  const spacerHeight = number('Spacer height', 0);

  return (
    <>
      {spacerHeight > 0 && (
        <div style={{ position: 'fixed', zIndex: 2000, width: '100%', backgroundColor: 'red', height: spacerHeight + 'px' }} />
      )}
      {spacerHeight > 0 && (
      <Sticky behavior={stickToTop}>
          <div style={{ height: spacerHeight + 'px' }} />
      </Sticky>
      )}
      <h1 style={stickyStyle1}>Nonsticky</h1>
      {[...Array(10)]
        .map((_, i) => i)
        .map((i) => (
          <p key={`bla-${i}`}>{`bla-${i}`}</p>
        ))}
      <HeightChangingHeader behavior={behavior1} style={stickyStyle1}>First</HeightChangingHeader>
      {[...Array(10)]
        .map((_, i) => i)
        .map((i) => (
          <p key={`first-${i}`}>{`first-${i}`}</p>
        ))}
      <Sticky behavior={behavior2}>
        <h1 style={stickyStyle2}>Second</h1>
      </Sticky>
      {[...Array(20)]
        .map((_, i) => i)
        .map((i) => (
          <p key={`second-${i}`}>{`second-${i}`}</p>
        ))}
      <Sticky behavior={behavior3}>
        <h1 style={stickyStyle3}>Third</h1>
      </Sticky>
      {[...Array(100)]
        .map((_, i) => i)
        .map((i) => (
          <p key={`third-${i}`}>{`third-${i}`}</p>
        ))}
    </>
  );
};

stories.add('In overflow container', () => {
  const behavior1 = selectBehavior('Behavior 1');
  const behavior2 = selectBehavior('Behavior 2');
  const behavior3 = selectBehavior('Behavior 3');

  return (
    <div style={{ paddingTop: '50px' }}>
      <StickyScrollContainer
        style={{
          height: '300px',
          backgroundColor,
        }}
      >
        <StickyContent
          behavior1={behavior1}
          behavior2={behavior2}
          behavior3={behavior3}
        />
      </StickyScrollContainer>
    </div>
  );
});

stories.add('In window', () => {
  const behavior1 = selectBehavior('Behavior 1');
  const behavior2 = selectBehavior('Behavior 2');
  const behavior3 = selectBehavior('Behavior 3');

  return (
    <StickyContainer>
      <StickyContent
        behavior1={behavior1}
        behavior2={behavior2}
        behavior3={behavior3}
      />
    </StickyContainer>
  );
});
