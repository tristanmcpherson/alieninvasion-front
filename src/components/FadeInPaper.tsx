import Paper from "@mui/material/Paper";
import React from "react";
import { animated, config, useSpring } from "@react-spring/web";

export const FadeInPaper = (props: React.PropsWithChildren) => {
    const fadeIn = useSpring({
        from: { opacity: 0 },
        to: { opacity: 1 },
        enter: { opacity: 1},
        leave: { opacity: 0 },
        config: config.slow,
    });

    const AnimatedPaper = animated(Paper);

    return <AnimatedPaper style={fadeIn}
            elevation={2}
            sx={{
                boxShadow: 1,
                borderRadius: 2,
                p: 2,
                minWidth: 340
            }}
			onClick={(ev) => {
				ev.stopPropagation();
				ev.preventDefault();
			}}
        >
            {props.children}
    </AnimatedPaper>;
};