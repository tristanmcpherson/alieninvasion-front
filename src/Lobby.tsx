import { Box, Divider, Stack, Dialog, Button } from '@mui/material';
import React, { useEffect, useRef, useState } from "react";
import { animated, useTransition } from "react-spring";
import { Card } from "./Card";
import { useGameState } from './GameService';
import { Loader } from "./Loader";
import { IGameState, IPlayer } from "./Models";
import { socket } from "./WebSocket";
import { useNavigate } from 'react-router-dom';
import styles from "./Lobby.module.css";
import { CharacterSelect } from './CharacterSelect';


const PlayerCard = ({ player }:
	{
		player: IPlayer
	}) => {
	const character: string = "cotton_streaker" as string as any;

	return <Box width={300}>
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
							{player.name}</Box>
						<Box sx={{ color: 'text.primary', fontSize: 28, fontWeight: 'medium' }}>
							{player.character ?? "Selecting..."}
						</Box>
					</Box>
				</Stack>
			</Box>
		</div>
	</Box>;
};


const Lobby = () => {
	const navigate = useNavigate();

	// useful to have entirety of gamestate?
	// maybe just use parts, then update isn't as bad?
	const [gameState, setGameState] = useGameState();
	const [character] = useState<string | null>();
	const [showCharacterSelection, setShowCharacterSelection] = useState(false);

	useEffect(() => {
		socket.on("lobbyJoined", (lobby, player) => {
			setGameState(gs => {
				return {
					...gs,
					lobby
				};
			});
		});

		socket.on("lobbyLeft", (playerId) => {
			setGameState(gs => {
				const lobby = gs.lobby;
				const players = lobby?.players ?? [];

				return {
					...gs,
					lobby: { ...lobby, players: players.filter(p => p._id !== playerId) },
				} as IGameState;
			})
		});

	}, [setGameState]);

	useEffect(() => {
		if (character === null || character === "") {
			const timeout = setTimeout(() => {
				setShowCharacterSelection(true);
			}, 2000);


			return () => clearTimeout(timeout);
		}
	}, [character]);

	// add polling for lobby info
	useEffect(() => {

		const timeout = setTimeout(() => {
			if (!gameState.lobby) {
				navigate({ pathname: "/" });
			}
		}, 1000);

		return () => clearTimeout(timeout);
	}, [navigate, gameState.lobby]);

	const transitions = useTransition(gameState.lobby?.players ?? [], {
		//api: 
		key: (player: IPlayer) => player._id,
		from: { opacity: 0, transform: 'translate3d(100%,0,0)' },
		enter: { opacity: 1, transform: 'translate3d(0%,0,0)' },
		leave: { opacity: 0, transform: 'translate3d(-50%,0,0)' },
	});

	if (!gameState.lobby) {
		console.log("WHAT");
		return <><Loader open={true} /></>;
	}
	console.log(gameState.lobby.players);

	return <>
		<CharacterSelect show={showCharacterSelection} />
		<Card>
			<Stack justifyContent={'center'} alignItems={'center'}>
				<Box sx={{ color: 'text.secondary' }}>Lobby code</Box>
				<Box sx={{ color: 'text.primary', fontSize: 36 }}>{gameState.lobby!._id}</Box>
				<Divider sx={{ width: '100%' }}></Divider>
				<Stack mt={2} direction={"column"}>
					{transitions((style, item) => (
						<animated.div key={item._id} style={{ "margin": "10px", ...style }}>
							<PlayerCard player={item}></PlayerCard>
						</animated.div>
					))}
				</Stack>
				<Button variant='outlined'>Start Game</Button>
			</Stack>
		</Card>
	</>;
};


export default Lobby;