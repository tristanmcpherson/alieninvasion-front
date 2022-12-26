import React, { useState } from 'react';
import { animated, config, useSpring, useTransition } from '@react-spring/web';

const AnimatedText: React.FC<{ text: string }> = ({ text }: { text: string }) => {
    const characters = [...text];
    const characterIndices = [...Array(characters.length).keys()];
    const randomValues = characterIndices.map(() => Math.random());
  
    const transitions = useTransition(characterIndices, {
      delay: 1000,
      from: { opacity: 0, translateY: 1 },
      enter: { opacity: 1, translateY: 0 },
      leave: { opacity: 0, translateY: 1 },
      config: config.molasses
    });
  
    return (
      <div>
        {transitions(({ opacity, translateY }, item) => {
          return (
            <animated.div
              style={{
                color: 'text.primary',
                fontSize: 36,
                display: 'inline-block',
                opacity: opacity,
                transform: translateY.to(
                  value => `perspective(600px) translate3d(0, -${value * (70 - (randomValues[item] * 50))}%, 0)`
                ),
              }}
            >
              {characters[item]}
            </animated.div>
          );
        })}
      </div>
    );
  };

export default AnimatedText;