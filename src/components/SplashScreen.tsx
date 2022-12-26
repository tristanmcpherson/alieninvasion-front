import React, { useState, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { Box, createTheme } from '@mui/material';

const SplashScreen: React.FC = () => {
    const [showContent, setShowContent] = useState(false);
    const imageUrl = 'https://picsum.photos/id/237/800/600'; // placeholder image URL
    const timeout = 5000; // splash screen timeout in milliseconds

    const imageSpring = useSpring({
        from: {
            opacity: 0,
        },
        to: {
            opacity: 1,
        },
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowContent(true);
        }, timeout);

        return () => {
            clearTimeout(timer);
        };
    }, []);

    if (showContent) {
        return <div>{/* content to be shown after splash screen */}</div>;
    }

    return (
        <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            width: '100vw'
        }}>
            <animated.img src={imageUrl} alt="splash screen" style={{
                ...imageSpring, 
                width: '100%',
                height: '100%',
                objectFit: 'cover'
            }} />
        </Box>
    );
};

export default SplashScreen;