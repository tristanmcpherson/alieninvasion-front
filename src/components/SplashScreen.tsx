import React, { useEffect, useState } from 'react';
import { animated, useTransition, config, SpringRef } from '@react-spring/web';
import { Backdrop, Box, Stack } from '@mui/material';
import fartian from '../images/fartian.png';
import crewmate from '../images/crewmate.png';
import { Faction } from '../core/Models';
import AnimatedText from './AnimatedText';

const SplashScreen: React.FC<{
    faction?: Faction;
    show?: boolean;
    onClose?: () => void;
    api?: SpringRef;
}> = ({ faction, show, onClose, api }) => {
    const [showBackdrop, setShowBackdrop] = useState(show || false);
    const imageUrl = faction && (faction === 'crewmate' ? crewmate : fartian); // placeholder image URL
    const timeout = 3000; // splash screen timeout in milliseconds

    const imageSpring = useTransition(show && faction ? [imageUrl] : [], {
        keys: (item) => 'image',
        delay: 1000,
        from: { opacity: 0.2 },
        enter: { opacity: 1 },
        leave: { opacity: 0 },
        config: config.molasses,
        expires: true,
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            onClose?.();
        }, timeout);

        return () => {
            clearTimeout(timer);
        };
    }, []);

    useEffect(() => {
        if (show) {
            setShowBackdrop(true);
        }
    }, [show]);

    const onRest = () => {
        onClose?.();
    };
    
    const onFinish = () => {
        setShowBackdrop(false);
    }

    return (
        <Backdrop
            open={showBackdrop}
            sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
            onClick={onClose}
        >
            <Stack
                justifyContent={'center'}
                alignItems="center"
                direction={{ xs: 'column', md: 'row' }}
            >
                <AnimatedText
                    fontFamily={
                        faction === 'fartian' ? 'Under Authority' : 'Bebas'
                    }
                    fontSize={{ xs: 46, md: 72 }}
                    textTransform="capitalize"
                    hide={!show}
                    text={`${faction}`}
                    onRest={onRest}
                    onFinish={onFinish}
                />

                <Box sx={{ width: { xs: 200, md: 320 } }} textAlign="center">
                    {imageSpring(({ opacity }, item) => (
                        <animated.img
                            src={item}
                            alt="splash screen"
                            style={{
                                opacity: opacity,
                                width: '100%',
                                height: '100%',
                                ...imageSpring,
                                objectFit: 'cover',
                            }}
                        />
                    ))}
                </Box>
            </Stack>
        </Backdrop>
    );
};

export default SplashScreen;
