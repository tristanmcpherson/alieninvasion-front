import { useContext, useEffect, useState } from "react";
import { useGameState, InitialGameState } from '../core/GameService';
import { socket, SocketStateContext } from "./WebSocket";

export const ConnectionComponent = ({ children }: React.PropsWithChildren) => {
    const [gameState, setGameState] = useGameState();
	const context = useContext(SocketStateContext);
	const [evaluateForReconnect, setEvaluateForReconnect] = useState<boolean>(false);

	useEffect(() => {
		socket.on("connect", () => {
			setEvaluateForReconnect(true);
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
		if (evaluateForReconnect) {
			if (gameState.lobby) {
				console.log("have lobby, firing reconnect with old socket: " + context.state.socketId)
                console.log("new socket: " + socket.id);
				socket.emit("rejoinLobby", gameState.lobby._id, context.state.socketId);
			}
			setEvaluateForReconnect(false);
		}

        if (context.state.socketId !== socket.id) {
            context.dispatch({ type: "set", socketId: socket.id });
        }
	}, [evaluateForReconnect, context, gameState.lobby]);

    return <>{children}</>;
}