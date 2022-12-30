import React, { useState, useEffect } from 'react';
import { useSpring, animated, config, useChain, useSpringRef } from '@react-spring/web';

interface CountdownProps {
    startNumber: number;
    onFadeOutComplete: () => void;
}

const Countdown: React.FC<CountdownProps> = ({ startNumber, onFadeOutComplete }) => {
    const [currentNumber, setCurrentNumber] = useState(startNumber);
    const [showCountdown, setShowCountdown] = useState(true);

    const fadeInProps = useSpring({
        opacity: 1,
        from: { opacity: 0 },
        config: config.slow
    });

    const fadeOutApi = useSpringRef();
    const fadeOutProps = useSpring({
        ref: fadeOutApi,
        opacity: 0,
        from: { opacity: 1 },
        config: config.slow,
        onRest: onFadeOutComplete,
    });

    useEffect(() => {
        const timer = setInterval(() => {

            if (currentNumber === 1) {             
                setShowCountdown(false);
                fadeOutApi.start();
                return;
            }

            setCurrentNumber((prevNumber) => prevNumber - 1);

        }, 1000);

        return () => clearInterval(timer);
    }, [currentNumber, startNumber, fadeOutApi]);


    return (
        <animated.div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            ...(showCountdown ? fadeInProps : fadeOutProps),
        }}>

            <animated.div style={{ ...fadeInProps, fontSize: '256px', color: 'white' }}>
                {currentNumber}
            </animated.div>
        </animated.div>
    );
};

export default Countdown;