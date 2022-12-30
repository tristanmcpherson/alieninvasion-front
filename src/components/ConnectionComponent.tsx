import { useEffect, useState } from "react";
import { socket } from "../core/WebSocket";
import { useAppDispatch, useAppSelector } from "../hooks";
import { resetGame, selectLobby, setCurrentPlayer } from "../slices/GameSlice";

export const ConnectionComponent = ({ children }: React.PropsWithChildren) => {
	const socketId = useAppSelector(state => state.gameState.currentPlayerId);
	const lobby = useAppSelector(selectLobby);
	const dispatch = useAppDispatch();

	const [evaluateForReconnect, setEvaluateForReconnect] = useState<boolean>(false);

	useEffect(() => {
		socket.on("connect", () => {
			setEvaluateForReconnect(true);
		});

        socket.on("lobbyLeft", playerId => {
            if (playerId === socketId) {
				console.log("Current player purposefully disconnected from lobby")
                dispatch(resetGame());
            }
        });

		return () => {
			socket.off("connect");
		};
	}, [socketId, dispatch]);

	useEffect(() => {
		if (evaluateForReconnect) {
			if (lobby && socketId) {
				console.log("have lobby and old socket id, firing reconnect with old socket: " + socketId)
                console.log("new socket: " + socket.id);
				socket.emit("rejoinLobby", lobby._id, socketId);
			}
			setEvaluateForReconnect(false);
		}

        if (socketId !== socket.id) {
            dispatch(setCurrentPlayer(socket.id));
        }
	}, [dispatch, evaluateForReconnect, socketId, lobby]);

    return <>{children}</>;
}