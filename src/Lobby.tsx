import { Box, Divider, Stack, Button } from '@mui/material';
import React, { useEffect, useState } from "react";
import { animated, useTransition } from '@react-spring/web';
import { Card } from "./Card";
import { useGameState } from './GameService';
import { Loader } from "./Loader";
import { IPlayer } from "./Models";
import { socket } from "./WebSocket";
import { useNavigate } from 'react-router-dom';
import { CharacterSelect } from './CharacterSelect';
import { Icons } from './images/Images';

import { PlayerCard } from './PlayerCard';
import AnimatedText from './AnimatedText';


const Lobby = () => {
	const navigate = useNavigate();
	// useful to have entirety of gamestate?
	// maybe just use parts, then update isn't as bad?
	// TODO: refactor gamestate into usable parts
	const [gameState, setGameState] = useGameState();
	const [showCharacterSelection, setShowCharacterSelection] = useState(false);
	
	// useTimeout(() => {
	// 	setShowCharacterSelection(true);
	// }, currentCharacter ? null : 2000);

	useEffect(() => {
		// ... preload images ... - ps i hate this
		Array.from(Icons.values()).map(image => new Image().src = image)
	}, []);

	useEffect(() => {
		socket.on("lobbyJoined", (lobby, player) => {
			setGameState(gs => {
				return {
					...gs,
					lobby,
					currentPlayer: gs.currentPlayer || !gs.lobby ? player : null
				}
			});
		});

		socket.on("lobbyLeft", (playerId) => {
			setGameState(gs => {
				const lobby = gs.lobby;
				if (!lobby) {
					return gs;
				}
				const players = lobby?.players ?? [];

				return {
					...gs,
					lobby: { ...lobby, players: players.filter(p => p._id !== playerId) }
				};
			})
		});

		socket.on("characterSelected", (playerId, character) => {
			setGameState(gameState => {
				const lobby = gameState.lobby;
				if (!lobby) {
					return gameState;
				}
				const players = lobby.players ?? [];

				return {
					...gameState,
					lobby: { ...lobby, players: players.map(p => p._id === playerId ? { ...p, character } : p) }
				};
			})
		});

		socket.on("startGame", (tasks) => {
			setGameState(gameState => {
				return {
					...gameState,
					tasks
				};
			})

			navigate({ pathname: "/game" });
		})

		return () => {
			socket.off("lobbyJoined");
			socket.off("lobbyLeft");
			socket.off("characterSelected");
		}
	}, [navigate, setGameState]);

	// add polling for lobby info
	useEffect(() => {

		const timeout = setTimeout(() => {
			if (!gameState.lobby) {
				console.log("lobby lost. returning to home.");
				navigate({ pathname: "/" });
			}
		}, 1000);

		return () => clearTimeout(timeout);
	}, [navigate, gameState.lobby]);

	console.log(gameState?.lobby);

	const transitions = useTransition(gameState.lobby?.players.sort((a, _) => a._id === socket.id ? -1 : 0) ?? [], {
		//api: 
		keys: (player: IPlayer) => player._id,
		from: { opacity: 0, transform: 'translate3d(100%,0,0)' },
		enter: { opacity: 1, transform: 'translate3d(0%,0,0)' },
		leave: { opacity: 0, transform: 'translate3d(-50%,0,0)' },
		
	});

	if (!gameState.lobby) {
		console.log("No game lobby on mount. Using loader");
		return <><Loader open={true} /></>;
	}

	const startGame = () => {
		socket.emit("startGame");
	};

	return <>
		<CharacterSelect show={showCharacterSelection} onClose={(characterId) => {
			setShowCharacterSelection(false)
			if (characterId && characterId !== gameState.lobby?.players.find(p => p._id === socket.id)?.character) {
				socket.emit("characterSelected", characterId);
			}
		}} />
		<Card>
			<Stack justifyContent={'center'} alignItems={'center'}>
				<Box sx={{ color: 'text.secondary' }}>Lobby code</Box>
				<AnimatedText text={gameState.lobby!._id}></AnimatedText>
				{/* <Box sx={{ color: 'text.primary', fontSize: 36 }}>{gameState.lobby!._id}</Box> */}
				<Divider sx={{ width: '100%' }}></Divider>
				<Stack mt={2} mb={2} direction={"column"}>
					{transitions((style, item) => (
						<animated.div style={style} key={item._id}>
							<PlayerCard key={item._id} player={item} onCharacterSelect={() => setShowCharacterSelection(true)}></PlayerCard>
						</animated.div>
					))}
				</Stack>
				<Divider sx={{ width: '100%' }}></Divider>
				<Button variant='outlined' onClick={() => startGame()}>Start Game</Button>
			</Stack>
		</Card>
	</>;
};


export default Lobby;