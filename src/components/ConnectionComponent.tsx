import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { socket } from "../core/WebSocket";
import { useAppDispatch, useAppSelector } from "../hooks";
import { addPlayer, addTasks, resetGame, selectLobby, setCurrentPlayer, setLobby, setPlayerFaction } from "../slices/GameSlice";

export const ConnectionComponent = ({ children }: React.PropsWithChildren) => {
	const socketId = useAppSelector(state => state.gameState.currentPlayerId);
	const lobby = useAppSelector(selectLobby);
	const dispatch = useAppDispatch();

	const [evaluateForReconnect, setEvaluateForReconnect] = useState<boolean>(false);
	const location = useLocation();
	const navigate = useNavigate();

	useEffect(() => {
		socket.on("connect", () => {
			console.log("Socket connected");
			console.log("Current socket id: " + socket.id);
			setEvaluateForReconnect(true);
		});

		socket.on("lobbyJoined", (lobby, player) => {
			console.log("Lobby joined");
			dispatch(setLobby(lobby));
			dispatch(addPlayer(player));
		});

		socket.on("rejoinGame", (lobby, tasks, faction) => {
			dispatch(setLobby(lobby));

			// game started
			if (faction) {
				dispatch(addTasks(tasks));
				dispatch(setPlayerFaction(faction));
				navigate({ pathname: "/game" });
			} else {
				navigate({ pathname: "/lobby" });
			}
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
	}, [socketId, location, dispatch, navigate]);

	useEffect(() => {
		console.log("Current player id: " + socketId);

		if (evaluateForReconnect) {
			console.log("Evaluating reconnect");
			if (lobby && socketId && socketId !== socket.id) {
				console.log("have lobby and old socket id, firing reconnect with old socket: " + socketId)
                console.log("new socket: " + socket.id);
				socket.emit("rejoinLobby", lobby._id, socketId);
			}
			setEvaluateForReconnect(false);
		}

        if (socketId !== socket.id && socket.id) {
            dispatch(setCurrentPlayer(socket.id));
        }
	}, [dispatch, evaluateForReconnect, socketId, lobby]);

    return <>{children}</>;
}