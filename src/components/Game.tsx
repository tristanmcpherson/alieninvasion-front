import React, { useState, useCallback, useEffect } from 'react';
import { useSound } from "use-sound";
import Button from "@mui/material/Button";
import { useLocation, useNavigate } from 'react-router-dom';
import red from '@mui/material/colors/red';
import { Container, ThemeProvider, createTheme, BottomNavigation, BottomNavigationAction, Paper, LinearProgress, Box, Stack } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import BallotIcon from '@mui/icons-material/Ballot';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Factions, ITask } from '../core/Models';
import { socket } from '../core/WebSocket';
import { animated, config, useChain, useSpring, useSpringRef, useTrail, UseTrailProps } from '@react-spring/web';
import { Loader } from './Loader';
import { PlayerCard } from './PlayerCard';
import AppBar from '@mui/material/AppBar';

import "./Controls.css";
import { useAppDispatch, useAppSelector } from '../hooks';
import { completeTask, sabotageTask, selectCurrentPlayer, selectLobby, selectTasks, setPlayerFaction } from '../slices/GameSlice';
import SplashScreen from './SplashScreen';
import Countdown from './Countdown';

function useQuery() {
	const { search } = useLocation();

	return React.useMemo(() => new URLSearchParams(search), [search]);
}

const Game = () => {
	const dispatch = useAppDispatch();
	const currentPlayer = useAppSelector(selectCurrentPlayer);
	const lobby = useAppSelector(selectLobby);
	const tasks = useAppSelector(selectTasks);
	const [showFaction, setShowFaction] = useState(false);

	const query = useQuery();
	const [isConnected, setIsConnected] = useState(socket.connected);

	const navigate = useNavigate();

	// const setTasks = useCallback((state: (tasks: ITask[]) => ITask[]) => {
	// 	dispatch(setTasks())
	// }, [gameState, setGameState]);

	const [showCompleted, setShowCompleted] = useState(false);
	const [canPlayAudio, setCanPlayAudio] = useState(false);
	const [playAssemble, setPlayAssemble] = useState(false);
	const [play] = useSound("/assemble.wav");

	const redTheme = createTheme({
		palette: {
			primary: red
		}
	});

	useEffect(() => {
		const timeout = setTimeout(() => {
			if (!lobby) {
				navigate({ pathname: "/" })
				return;
			}
		}, 1000)
		return () => clearTimeout(timeout);
	}, [lobby, navigate]);

	useEffect(() => {
		if (currentPlayer?.faction) {
			// need to investigate showing once per game
			// store this state in store instead?
			const timeout = setTimeout(() => {
				setShowFaction(true);
			});

			return () => clearTimeout(timeout);
		}
	}, [currentPlayer?.faction]);

	useEffect(() => {
		socket.on("connect", () => setIsConnected(true));

		socket.on("updateTaskStatus", (task) => {
			console.log(task.id + " : " + task.completed);
			if (task.completed) {
				dispatch(completeTask(task.id));
			} else {
				dispatch(sabotageTask(task.id));
			}
		});

		socket.io.on("reconnect_failed", () => {
			navigate({ pathname: "/" });
		});

		socket.on("disconnect", reason => {
			setIsConnected(false);
			if (reason === "io server disconnect" || reason === "io client disconnect") {
				navigate({ pathname: "/" });
			}
		});

		socket.on("assemble", () => {
			setPlayAssemble(true);
		});

		socket.on("ping", () => {
			console.log("pinged");
		});

		return () => {
			socket.off("connect");
			socket.off("disconnect");
			socket.off("assemble");
			socket.off("updateTaskStatus");
		};
	}, [navigate, dispatch]);

	useEffect(() => {
		const interval = setInterval(() => {
			try {
				new AudioContext();
				setCanPlayAudio(true);
			} catch {
				setCanPlayAudio(false);
			}
		}, 1000);

		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		if (playAssemble) {
			try {
				play();
			} catch {
				alert("Please assemble");
			}
			//new Audio("/assemble.wav").play();
			setPlayAssemble(false);
		}
	}, [playAssemble, play]);

	const handleClickSendMessage = useCallback(() => socket.emit("assemble"), []);

	const setStatus = (id: string, completed: boolean) => {
		const updateMessage = {
			id,
			completed
		};
		socket.emit("updateTaskStatus", updateMessage);
	};


	const renderTask = (task: ITask) => {
		return <div className="task" key={task.id}>
			<div className="info">
				<div className='name'>{task.name}</div>
				<div className="description">{task.description}</div>
			</div>
			{showCompleted ? <Box sx={{ color: task.completed ? "success.main" : "error.main" }}>{task.completed ? "Completed" : "Not Completed"}</Box> : null}
			<div className="vertical">
				<Button variant="outlined" onClick={() => setStatus(task.id, true)}>Complete</Button>
				<ThemeProvider theme={redTheme}>
					<Button variant="outlined" onClick={() => setStatus(task.id, false)}>Sabotage</Button>
				</ThemeProvider>
			</div>
		</div>;
	};

	const renderDebug = () => {
		if (!query.has("debug")) {
			return null;
		}

		return <>
			<div><span>Socket.io {isConnected ? "connected" : "disconnected"}</span></div>
			<div><span>Can play audio: {canPlayAudio ? "true" : "false"}</span></div>
		</>;

	};

	const fadeIn = useSpring({
		from: { opacity: 0 },
		to: { opacity: 1 },
		enter: { opacity: 1 },
		leave: { opacity: 0 },
		config: config.molasses,
	});

	const trailFadeConfig: UseTrailProps = {
		from: { opacity: 0 },
		opacity: 1,
		delay: 200,
		config: config.molasses
	};

	const trails = useTrail(tasks.length, trailFadeConfig);

	//useChain([splashScreenApi, gameAnimationApi]);

	if (!lobby) {
		return <Loader open={true}></Loader>;
	}

	const progress = (tasks && tasks.length !== 0) ? (tasks.filter(t => t.completed).length / tasks.length) * 100 : 0;
	const taskContainer = <Container>
		<Stack direction="row" sx={{ marginBottom: "5px" }}>
			<div className="progress">
				<BallotIcon fontSize='small' />
				<Box>Tasks</Box>
				{progress === 100 ? <CheckCircleIcon color='success' fontSize='small' /> : null}
			</div>
		</Stack>
		<LinearProgress variant="determinate" value={progress} color={progress === 100 ? "success" : undefined} />
	</Container>;

	return (<>
		{/* <Countdown startNumber={3} onFadeOutComplete={() => {}}></Countdown> */}
		<SplashScreen faction={currentPlayer?.faction} show={showFaction} onClose={() => setShowFaction(false)}></SplashScreen>
		<Stack className="controls" sx={{ pb: 7 }} spacing={3} pl={{ lg: 15 }} pr={{ lg: 15 }}>
			<AppBar />
			{/* <span>Can use audio: {new AudioContext().state === "suspended" ? "no" : "yes"}</span> */}
			{/* <Box><Button>Start Round</Button></Box>
            
            <Box><Button>Start Meeting</Button></Box> */}
			{renderDebug()}

			<animated.div style={{ display: "flex", flex: 1, width: "100%", ...fadeIn }}>
				{taskContainer}
			</animated.div>
			{currentPlayer && <PlayerCard player={currentPlayer} onCharacterSelect={() => { }} />}
			<div className="buttons">
				<ThemeProvider theme={redTheme}>
					<Button variant="contained" onClick={handleClickSendMessage}>Assemble</Button>
				</ThemeProvider>
				<Button variant="contained" onClick={() => setShowCompleted(s => !s)}>Show Status</Button>
			</div>
			<Box className="tasks">
				{trails.map(({ opacity }, index) =>
					<animated.div key={tasks[index].id} style={{ opacity }}>
						{renderTask(tasks[index])}
					</animated.div>
				)}

			</Box>
		</Stack>
		<Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
			<BottomNavigation onChange={(_event, _newValue) => { navigate("/") }}>
				<BottomNavigationAction label="Home" icon={<HomeIcon />} />
			</BottomNavigation>
		</Paper>
	</>);
};

export default Game;
