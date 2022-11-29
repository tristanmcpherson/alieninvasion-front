import { Box, Button, Stack, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import logo from './alien.png';
import { socket } from './WebSocket';
import './App.css';
import { useGameState } from './GameService';

const createLobby = async () => {
  socket.emit("createLobby");
};

function App() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useGameState();

  useEffect(() => {
    socket.on("lobbyJoined", (lobby) => {
      setGameState({ lobby, ...gameState });
      navigate({ pathname: "game" });
    });
    return () => {
      socket.off("lobbyJoined");
    };
  }, []);

  return (
    <div className="App">
        <Box marginTop={{ xs: 8, md: 24 }}>
          <img src={logo} className="App-logo" alt="logo" />

          <Stack margin={{ xs: 4, md: 8 }}>


            <Typography fontSize={96} sx={{ fontFamily: 'Comic Neue, cursive' }} variant="h3">Fartian</Typography>
            <Stack sx={{ margin: { xs: 8, md: 12 }}} direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 4, md: 12 }} display={"flex"} justifyContent={"center"}>
              <Button variant="outlined" color="success" size="large" onClick={() => createLobby()}>CREATE LOBBY</Button>
              <Button variant="outlined" size="large" onClick={() => navigate({ pathname: "join" })}>JOIN LOBBY</Button>
            </Stack>
          </Stack>
        </Box>
    </div>
  );
}

export default App;
