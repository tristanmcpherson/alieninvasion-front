import React, { useEffect, useState } from 'react';
import { Box, SxProps } from '@mui/material';
import { animated, useTransition } from '@react-spring/web';

const AnimatedText: React.FC<
    {
        text: string;
        hide?: boolean;
        reset?: boolean;
        onRest?: () => void;
        onFinish?: () => void;
    } & SxProps
> = ({ text, hide, reset, onRest, onFinish, ...sx }) => {
    const characters = [...text];
    const characterIndices = [...Array(characters.length).keys()];
    const randomValues = characterIndices.map(() => Math.random());

    const transitions = useTransition(hide ? [] : characterIndices, {
        keys: (item) => text + item,
        delay: 1000,
        from: { opacity: 0, translateY: 1 },
        enter: { opacity: 1, translateY: 0 },
        leave: { opacity: 0, translateY: 1 },
        config: { tension: 300, friction: 80 },
        onRest: (sv) => {
            if (sv.value.opacity === 0) {
              onFinish?.();
            }
            else {
              onRest?.();
            }
        },
        expires: false,
    });

    const AnimatedBox = animated(Box);

    return (
        <div>
            {transitions(({ opacity, translateY }, item) => (
                <AnimatedBox
                    style={{
                        opacity: opacity,
                        transform: translateY.to(
                            (value) =>
                                `translate3d(0, -${
                                    value * (70 - randomValues[item] * 60)
                                }%, 0)`
                        ),
                    }}
                    sx={{
                        color: 'text.primary',
                        fontSize: 36,
                        display: 'inline-block',
                        ...sx,
                    }}
                >
                    {characters[item]}
                </AnimatedBox>
            ))}
        </div>
    );
};

export default AnimatedText;
