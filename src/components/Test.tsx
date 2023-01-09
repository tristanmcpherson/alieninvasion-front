import React from "react";
import { Button } from '@mui/material';
import { useState } from 'react';
import AnimatedText from './AnimatedText';
import SplashScreen from "./SplashScreen";

const Test: React.FC<{}> = () => {
    const [showAnimatedText, setShowAnimatedText] = useState(false);
    const [showSplash, setShowSplash] = useState(false);

    return (
        <>
            <Button onClick={() => setShowAnimatedText(true)}>Show Animation</Button>
            <AnimatedText text="TESTING" hide={!showAnimatedText} onRest={() => setShowAnimatedText(false)}></AnimatedText>

            <Button onClick={() => setShowSplash(true)}>Show Splash</Button>
            <SplashScreen show={showSplash} faction="fartian" onClose={() => setShowSplash(false)}></SplashScreen>
        </>
    );
};

export default Test;