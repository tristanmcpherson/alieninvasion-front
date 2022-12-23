import React, { useState, useCallback, useEffect } from 'react';
import { useSound } from "use-sound";
import Button from "@mui/material/Button";
import { useLocation, useNavigate } from 'react-router-dom';
import red from '@mui/material/colors/red';
import { Container, ThemeProvider, createTheme, BottomNavigation, BottomNavigationAction, Paper, LinearProgress, Box, Stack } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import BallotIcon from '@mui/icons-material/Ballot';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { ITask } from './Models';
import { socket } from './WebSocket';
import { useGameState } from './GameService';
import { animated, config, useSpring, useTrail, UseTrailProps } from '@react-spring/web';
import { Loader } from './Loader';
import "./Controls.css";

function useQuery() {
	const { search } = useLocation();

	return React.useMemo(() => new URLSearchParams(search), [search]);
}

const Game = () => {
	const query = useQuery();
	const [isConnected, setIsConnected] = useState(socket.connected);

	const navigate = useNavigate();
	const [gameState, setGameState] = useGameState();
	const tasks = gameState.tasks;

	const setTasks = useCallback((state: (tasks: ITask[]) => ITask[]) => {
		setGameState(old => {
			const newTasks = state(old.tasks);
			return { ...gameState, tasks: newTasks }
		});
	}, [gameState, setGameState]);

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
			if (!gameState.lobby) {
				navigate({ pathname: "/" })
				return;
			}
		}, 1000)
		return () => clearTimeout(timeout);
	}, [gameState.lobby, navigate]);

	useEffect(() => {
		//setCanUseAudio(audioContext.state !== "suspended");
	}, []);


	useEffect(() => {
		const fetchData = () => {
			if (gameState.lobby && socket.connected) {
				fetch(`/api/task/${gameState.lobby._id}/${socket.id}`)
					.then(response => {
						if (response.status === 404 || response.status === 400) {
							navigate({ pathname: "/" });
						}
						return response;
					})
					.then(response => response.json())
					.then(data => setTasks(() => data));
			}
		};

		const interval = setInterval(() => {
			fetchData();
		}, 10000);
		return () => clearInterval(interval);
	}, [gameState.lobby, navigate, setTasks]);

	useEffect(() => {
		socket.on("connect", () => setIsConnected(true));

		socket.on("updateTaskStatus", (task) => {
			console.log(task.id + " : " + task.completed);
			setTasks(tasks => tasks.map(t => t.id === task.id ? task : t));
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

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
		const updateMessage: ITask = {
			id,
			completed
		};
		socket.emit("updateTaskStatus", updateMessage);
	};

	const progress = (tasks && tasks.length !== 0) ? (tasks.filter(t => t.completed).length / tasks.length) * 100 : 0;

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

	//const transitions = useTransition(tasks, );



	const fadeIn = useSpring({
		from: { opacity: 0 },
		to: { opacity: 1 },
		enter: { opacity: 1 },
		leave: { opacity: 0 },
		config: config.molasses,
	});

	const fadeConfig: UseTrailProps = {
		from: { opacity: 0 },
		opacity: 1,
		delay: 200,
		config: config.molasses
	};

	const trails = useTrail(tasks.length, fadeConfig);


	if (!gameState.lobby) {
		return <Loader open={true}></Loader>;
	}

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
		<Box className="controls" sx={{ pb: 7 }}>
			{/* <span>Can use audio: {new AudioContext().state === "suspended" ? "no" : "yes"}</span> */}
			{/* <Box><Button>Start Round</Button></Box>
            
            <Box><Button>Start Meeting</Button></Box> */}
			{renderDebug()}

			<animated.div style={{ display: "flex", flex: 1, width: "100%", ...fadeIn }}>
				{taskContainer}
			</animated.div>
			<div className="buttons">
				<ThemeProvider theme={redTheme}>
					<Button variant="contained" onClick={handleClickSendMessage}>Assemble</Button>
				</ThemeProvider>
				<Button variant="contained" onClick={() => setShowCompleted(s => !s)}>Show Status</Button>
			</div>
			<div className="tasks">
				{trails.map(({ opacity }, index) =>
					<animated.div key={tasks[index].id} style={{ opacity }}>
						{renderTask(tasks[index])}
					</animated.div>
				)}

			</div>
		</Box>
		<Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
			<BottomNavigation onChange={(_event, _newValue) => { navigate("/") }}>
				<BottomNavigationAction label="Home" icon={<HomeIcon />} />
			</BottomNavigation>
		</Paper>
	</>);
};

export default Game;