import { Box, Divider, Stack, Button } from '@mui/material';
import React, { useEffect, useState } from "react";
import { animated, useSpring, useTransition } from '@react-spring/web';
import { Card } from "./Card";
import { Loader } from "./Loader";
import { IPlayer } from "../core/Models";
import { socket } from "../core/WebSocket";
import { useNavigate } from 'react-router-dom';
import { CharacterSelect } from './CharacterSelect';
import { Icons } from '../images/Images';

import { PlayerCard } from './PlayerCard';
import AnimatedText from './AnimatedText';
import { useAppDispatch, useAppSelector } from '../hooks';
import { addTasks, changeCharacter, removePlayer, resetGame, selectCurrentPlayer, selectFartianCount, selectLobby, selectTasks, setFartianCount, setLobby, setPlayerFaction } from '../slices/GameSlice';
import GroupedButtons from './GroupedButton';


const Lobby = () => {
	const navigate = useNavigate();

	const fartianCount = useAppSelector(selectFartianCount);
	const lobby = useAppSelector(selectLobby);
	const tasks = useAppSelector(selectTasks);
	const currentPlayer = useAppSelector(selectCurrentPlayer);

	const dispatch = useAppDispatch();
	// useful to have entirety of gamestate?
	// maybe just use parts, then update isn't as bad?
	// TODO: refactor gamestate into usable parts
	const [showCharacterSelection, setShowCharacterSelection] = useState(false);

	// useTimeout(() => {
	// 	setShowCharacterSelection(true);
	// }, currentCharacter ? null : 2000);

	useEffect(() => {
		if (tasks.length > 0) {
			navigate({ pathname: "/game" });
		}

	}, [tasks]);

	useEffect(() => {
		setShowCharacterSelection(false);
	}, [currentPlayer?.character]);

	useEffect(() => {
		// ... preload images ... - ps i hate this
		Array.from(Icons.values()).map(image => new Image().src = image)
	}, []);

	useEffect(() => {
		socket.on("lobbyJoined", (lobby, player) => {
			// server sends all players every time a player is joined
			// maybe send full list as separate to client that has joined
			// and differential to all other players
			dispatch(setLobby(lobby));
		});

		socket.on("lobbyLeft", (playerId) => {
			dispatch(removePlayer(playerId));
		});

		socket.on("characterSelected", (playerId, newCharacter) => {
			dispatch(changeCharacter({ playerId, newCharacter }));
		});

		socket.on("startGame", (tasks, faction) => {
			dispatch(addTasks(tasks));
			dispatch(setPlayerFaction(faction));

			navigate({ pathname: "/game" });
		});

		return () => {
			socket.off("lobbyJoined");
			socket.off("lobbyLeft");
			socket.off("characterSelected");
			socket.off("startGame");
		}
	}, [navigate, dispatch]);

	// add polling for lobby info
	useEffect(() => {

		const timeout = setTimeout(() => {
			if (!lobby) {
				console.log("lobby lost. returning to home.");
				navigate({ pathname: "/" });
			}
		}, 1000);

		return () => clearTimeout(timeout);
	}, [navigate, lobby]);

	console.log(lobby);

	const [containerSpring, set] = useSpring(
		() => ({ height: "0%" }),
	);


	const transitions = useTransition(lobby?.players ?? [], {
		keys: (player: IPlayer) => player.name,
		sort: (a: IPlayer) => a._id === currentPlayer?._id ? -1 : 0,
		from: { opacity: 0, transform: 'translate3d(100%,0,0)' },
		enter: { opacity: 1, transform: 'translate3d(0%,0,0)' },
		leave: { opacity: 0, transform: 'translate3d(-50%,0,0)' },
		onRest: () => {
			set.start({ height: '100%' });
		}
	});


	if (!lobby) {
		console.log("No game lobby on mount. Using loader");
		return <><Loader open={true} /></>;
	}

	const startGame = () => {
		socket.emit("startGame", { numberOfFartians: fartianCount });
	};

	const leaveGame = () => {
		dispatch(resetGame());
		socket.emit("leaveGame");
	}

	const AnimatedStack = animated(Stack);

	return <>
		<CharacterSelect show={showCharacterSelection} onClose={() => {
			setShowCharacterSelection(false)
		}} />
		<Card>
			<Stack spacing={2} justifyContent={'center'} alignItems={'center'}>
				<Stack direction="column" justifyContent={'center'} alignItems={'center'}>
					<Box sx={{ color: 'text.secondary' }}>Lobby code</Box>
					<AnimatedText text={lobby!._id}></AnimatedText>
					<Stack mt={1} justifyContent="center" alignItems="center" direction="row" spacing={1}>
						<Box>Number of Fartians:</Box>
						<GroupedButtons initialValue={1} lowerBound={1} valueChanged={(number) => dispatch(setFartianCount(number))} />
					</Stack>
				</Stack>
				{/* <Box sx={{ color: 'text.primary', fontSize: 36 }}>{gameState.lobby!._id}</Box> */}
				<Divider sx={{ width: '100%' }}></Divider>
				<AnimatedStack maxHeight={"50vh"} sx={{ overflowY: "auto", overflowX: "visible" }} direction={"column"}>
					{transitions((style, item) => (
						<animated.div style={style} key={item._id}>
							<PlayerCard key={item._id} player={item} onCharacterSelect={() => setShowCharacterSelection(true)}></PlayerCard>
						</animated.div>
					))}
				</AnimatedStack>
				<Divider sx={{ width: '100%' }}></Divider>
				<Stack direction="row" spacing={5}>
					<Button variant='outlined' color="error" onClick={() => leaveGame()}>Leave Game</Button>
					<Button variant='outlined' onClick={() => startGame()}>Start Game</Button>
				</Stack>
			</Stack>
		</Card>
	</>;
};


export default Lobby;