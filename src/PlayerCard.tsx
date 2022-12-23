import { Box, Stack } from "@mui/material";
import { useSpringRef, useSpring, useChain, useTransition, animated, config } from '@react-spring/web';
import { useState, useEffect } from "react";
import { Characters, Icons } from "./images/Images";
import { IPlayer, ICharacter } from "./Models";
import BlurOnIcon from '@mui/icons-material/BlurOn';
import styles from "./Lobby.module.css";

interface IPlayerCardProps {
    player: IPlayer,
    onCharacterSelect: () => void;
}


export const PlayerCard: React.FC<IPlayerCardProps> = (props: IPlayerCardProps) => {
    const character = Characters.find(c => c._id === props.player.character);
    const icon = Icons.get(props.player.character);

    const [characterName, setCharacterName] = useState<string | undefined>("Selecting...");
    const [characterTitle, setCharacterTitle] = useState<string | undefined>(character?.title);

    useEffect(() => {
        if (characterName !== character?.name) {
            setCharacterName(character?.name ?? "Selecting...");
        }
        if (characterTitle !== character?.title) {
            setCharacterTitle(character?.title);
        }
    }, [character, characterName, characterTitle]);

    const image = icon
        ? <img alt="Selected character" onClick={props.onCharacterSelect} src={icon} width={80} height={80}></img>
        : <BlurOnIcon sx={{ fontSize: "80px" }} onClick={props.onCharacterSelect} />;

    console.log("rerendering player card")

    const fadeInApi = useSpringRef();
    const fadeIn = useSpring({
        ref: fadeInApi,
        from: { opacity: 0 },
        to: { opacity: 1 },
        config: config.slow
    });

    const fadeInNameApi = useSpringRef();
    const fadeInName = useTransition([characterName], {
        ref: fadeInNameApi,
        from: { opacity: 0 },
        to: { opacity: 1 },
        enter: { opacity: 1 },
        leave: { opacity: 0 },
        config: { duration: 1000 },
        exitBeforeEnter: true
    });

    const fadeInTitleApi = useSpringRef();
    const fadeInTitle = useTransition([characterTitle], {
        ref: fadeInTitleApi,
        from: { opacity: 0 },
        to: { opacity: 1 },
        enter: { opacity: 1 },
        leave: { opacity: 0 },
        config: { duration: 1000 },
        exitBeforeEnter: true
    });

    useChain([fadeInApi, fadeInNameApi, fadeInTitleApi]);

    return <Box width={300} m={1}>
        <div className={[styles.border_animate, styles.selecting].join(" ")}>
            <Box
                sx={{
                    bgcolor: 'background.paper',
                    boxShadow: 1,
                    borderRadius: 2,
                    p: 2,
                    minWidth: 300,
                    zIndex: 3
                }}
            >
                <Stack direction={"row"} justifyContent={"space-between"}>
                    <Box>
                        <Box sx={{ color: 'text.secondary', display: 'inline', fontSize: 14 }}>
                            <animated.div style={fadeIn}>
                                {props.player.name}
                            </animated.div>
                        </Box>
                        <Box sx={{ color: 'text.primary', fontSize: 20, fontWeight: 'medium' }}>
                            {fadeInName((style, text) =>
                                <animated.div style={style}>
                                    {text}
                                </animated.div>
                            )}
                        </Box>
                        <Box sx={{ color: 'text.secondary', display: 'inline', fontSize: 16 }}>
                            {fadeInTitle((style, text) =>
                                <animated.div style={style}>
                                    {text}
                                </animated.div>
                            )}
                        </Box>
                    </Box>
                    {image}
                </Stack>
            </Box>
        </div>
    </Box>;
};
