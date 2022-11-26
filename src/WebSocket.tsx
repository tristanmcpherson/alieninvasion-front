import React, { useState, useCallback, useEffect, useTransition } from 'react';
import { useSound } from "use-sound";
import { Button } from "@mui/material";
import io, { Socket } from "socket.io-client";
import { useSpring, animated, useTrail, config, Transition } from 'react-spring'
import { useNavigate } from 'react-router-dom';
import red from '@mui/material/colors/red';
import green from '@mui/material/colors/green';
import { Container, ThemeProvider, createTheme, BottomNavigation, BottomNavigationAction, Paper, LinearProgress, Box, Stack } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import BallotIcon from '@mui/icons-material/Ballot';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import "./Controls.css";
import { render } from 'react-dom';


export interface IAmongus {
  _id: string,
  name?: string,
  description?: string,
  completed?: boolean
}

export interface SharedEvents {
    assemble: () => void;
    statusUpdate: (amongus: IAmongus) => void;
    ping: () => void;
}

const host = window.location.hostname;
const socketUrl = `wss://${host}:8080`;
const socket: Socket<SharedEvents, SharedEvents> = io(socketUrl, {
    reconnectionDelay: 50
});

const WebSocketDemo = () => {
    const [isConnected] = useState(socket.connected);

    const navigate = useNavigate();
    const [tasks, setTasks] = useState<IAmongus[]>([]);
    const [showCompleted, setShowCompleted] = useState(false);
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
        fetch(`https://${host}:8080/api/amongus`)
        .then(response => response.json())
        .then(data => setTasks(data));
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
        socket.on("statusUpdate", (amongus) => {
            //console.log(amongus._id + " : " + amongus.completed);
            //const newTasks = tasks;            
            setTasks(oldTasks => oldTasks.map(t => t._id === amongus._id ? amongus : t));
        });

        socket.on("assemble", () => {
            setPlayAssemble(true);
        })

        socket.on("ping", () =>{
            console.log("pinged");
        })

        return () => {
            socket.off("ping");
            socket.off("connect");
            socket.off("disconnect");
            socket.off("assemble");
            socket.off("statusUpdate");
        };
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
    }, [playAssemble]);

    const handleClickSendMessage = useCallback(() => socket.emit("assemble"), []);

    const setStatus = (_id: string, completed: boolean) => {
        const updateMessage: IAmongus = {
            _id,
            completed
        };
        socket.emit("statusUpdate", updateMessage);
    };

    const progress = tasks ? (tasks.filter(t => t.completed).length / tasks.length) * 100 : 0;

    const renderTask = (task: IAmongus) => {
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

    return (<>
        <div className="controls">
            {/* <span>Can use audio: {new AudioContext().state === "suspended" ? "no" : "yes"}</span> */}
            {/* <Box><Button>Start Round</Button></Box>
            
            <Box><Button>Start Meeting</Button></Box> */}
            <Container sx={{ width: '80%', mr: 1 }}>
                <Stack direction="row" sx={{marginBottom: "5px"}}>
                    <div className="progress">
                        <BallotIcon fontSize='small'/>
                        <Box>Tasks</Box>
                        {progress === 100 ? <CheckCircleIcon color='success' fontSize='small'/> : null}
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

            <div><span>Socket.io connection: {isConnected}</span></div>
        </div>
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
            <BottomNavigation

                onChange={(event, newValue) => {
                    navigate("/")
                }}
            >
                <BottomNavigationAction label="Home" icon={<HomeIcon />} />
            </BottomNavigation>
        </Paper>
    </>);
};

export default WebSocketDemo;