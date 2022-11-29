import React, { useState, useCallback, useEffect } from 'react';
import { useSound } from "use-sound";
import { Button } from "@mui/material";
import { useLocation, useNavigate } from 'react-router-dom';
import red from '@mui/material/colors/red';
import { Container, ThemeProvider, createTheme, BottomNavigation, BottomNavigationAction, Paper, LinearProgress, Box, Stack } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import BallotIcon from '@mui/icons-material/Ballot';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import "./Controls.css";
import { ITask } from './Models';
import { socket } from './WebSocket';
import { useGameState } from './GameService';

// A custom hook that builds on useLocation to parse
// the query string for you.
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

    const setTasks = (tasks: ITask[]) => setGameState({ tasks });

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
        //setCanUseAudio(audioContext.state !== "suspended");
    }, []);

    const fetchData = () => {
        if (gameState.lobby) {
            fetch(`/api/task/${gameState.lobby._id}`)
                .then(response => response.json())
                .then(data => setTasks(data));
        }
    };
    useEffect(() => {
        fetchData();
        const interval = setInterval(() => {
            fetchData();
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            socket.emit("ping");
        }, 1000);
        return () => {
            clearInterval(interval);
        }
    }, []);

    useEffect(() => {
        socket.on("connect", () => setIsConnected(true));
        socket.on("disconnect", () => setIsConnected(false));

        socket.on("updateTaskStatus", (task) => {
            //console.log(task._id + " : " + task.completed);
            //const newTasks = tasks;            
            setTasks(tasks.map(t => t._id === task._id ? task : t));
        });

        socket.on("assemble", () => {
            setPlayAssemble(true);
        })

        socket.on("ping", () => {
            console.log("pinged");
        })

        return () => {
            socket.off("connect");
            socket.off("disconnect");
            socket.off("assemble");
            socket.off("updateTaskStatus");
        };
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

    const setStatus = (_id: string, completed: boolean) => {
        const updateMessage: ITask = {
            _id,
            completed
        };
        socket.emit("updateTaskStatus", updateMessage);
    };

    const progress = tasks ? (tasks.filter(t => t.completed).length / tasks.length) * 100 : 0;

    const renderTask = (task: ITask) => {
        return <div className="task" key={task._id}>
            <div className="info">
                <div className='name'>{task.name}</div>
                <div className="description">{task.description}</div>
            </div>
            {showCompleted ? <Box sx={{ color: task.completed ? "success.main" : "error.main" }}>{task.completed ? "Completed" : "Not Completed"}</Box> : null}
            <div className="vertical">
                <Button variant="outlined" onClick={() => setStatus(task._id, true)}>Complete</Button>
                <ThemeProvider theme={redTheme}>
                    <Button variant="outlined" onClick={() => setStatus(task._id, false)}>Sabotage</Button>
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

    return (<>
        <div className="controls">
            {/* <span>Can use audio: {new AudioContext().state === "suspended" ? "no" : "yes"}</span> */}
            {/* <Box><Button>Start Round</Button></Box>
            
            <Box><Button>Start Meeting</Button></Box> */}
            {renderDebug()}
            {gameState?.lobby ? <p>{`Lobby code: ${gameState.lobby._id}`}</p> : null}
            <Container sx={{ width: '80%', mr: 1 }}>
                <Stack direction="row" sx={{ marginBottom: "5px" }}>
                    <div className="progress">
                        <BallotIcon fontSize='small' />
                        <Box>Tasks</Box>
                        {progress === 100 ? <CheckCircleIcon color='success' fontSize='small' /> : null}
                    </div>
                </Stack>
                <LinearProgress variant="determinate" value={progress} color={progress === 100 ? "success" : undefined} />
            </Container>

            <div className="buttons">
                <ThemeProvider theme={redTheme}>
                    <Button variant="contained" onClick={handleClickSendMessage}>Assemble</Button>
                </ThemeProvider>
                <Button variant="contained" onClick={() => setShowCompleted(s => !s)}>Show Status</Button>
            </div>
            <div className="tasks">{tasks.map(renderTask)}</div>
        </div>
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
            <BottomNavigation onChange={(_event, _newValue) => { navigate("/") }}>
                <BottomNavigationAction label="Home" icon={<HomeIcon />} />
            </BottomNavigation>
        </Paper>
    </>);
};

export default Game;