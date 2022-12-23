import { useContext, useEffect, useState } from "react";
import { useGameState, InitialGameState } from './GameService';
import { socket, SocketStateContext } from "./WebSocket";

export const ConnectionComponent = ({ children }: React.PropsWithChildren) => {
    const [gameState, setGameState] = useGameState();
	const context = useContext(SocketStateContext);
	const [attemptReconnect, setAttemptReconnect] = useState<boolean>(false);

	useEffect(() => {
		socket.on("connect", () => {
			setAttemptReconnect(true);
		});

        socket.on("lobbyLeft", playerId => {
            if (playerId === socket.id) {
                setGameState({...InitialGameState});
            }
        });

		return () => {
			socket.off("connect");
		};
	}, [setGameState]);

	useEffect(() => {
		if (attemptReconnect) {
			console.log("attempting reconnect");
			if (gameState.lobby) {
				console.log("have lobby, firing reconnect with old socket: " + context.state.socketId)
                console.log("new socket: " + socket.id);
				socket.emit("rejoinLobby", gameState.lobby._id, context.state.socketId);
			}
			setAttemptReconnect(false);
		}

        if (context.state.socketId !== socket.id) {
            context.dispatch({ type: "set", socketId: socket.id });
        }
	}, [attemptReconnect, context, gameState.lobby]);

    return <>{children}</>;
}