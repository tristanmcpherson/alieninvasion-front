import { createContext, useReducer } from "react";
import { Socket, io } from "socket.io-client";
import { ITask, ILobby, IPlayer } from "./Models";

export interface SharedEvents {
	assemble: () => void;
	updateTaskStatus: (task: ITask) => void;
	ping: () => void;
}

export interface ClientEvents extends SharedEvents {
	joinLobby: (lobbyId: string, name: string) => void;
	rejoinLobby: (lastPlayerId: string, lobbyId: string) => void;
	createLobby: (name: String) => void;
	characterSelected: (characterId: string) => void;
}

export interface ServerEvents extends SharedEvents {
	lobbyJoined: (lobby: ILobby, player: IPlayer) => void;
	lobbyLeft: (playerId: string) => void;
	startGame: (tasks: ITask[]) => void;
	characterSelected: (playerId: string, characterId: string) => void;
}

export type Action = { type: 'set', socketId: string };

export type State = { socketId: string };

export type SocketStateContextType = { state: State, dispatch: (action: Action) => void };

const initial = { state: { socketId: "" }, dispatch: () => { } };
export const SocketStateContext = createContext<SocketStateContextType>(initial);
const socketStateReducer = (state: State, action: Action): State => {
	switch (action.type) {
		case 'set':
			return { ...state, socketId: action.socketId };
		default:
			throw new Error();
	}
};

export const SocketStateProvider = ({ children }: {} & React.PropsWithChildren) => {
	const [state, dispatch] = useReducer(socketStateReducer, { socketId: "" });
	return (
		<SocketStateContext.Provider value={{ state, dispatch }}>
			{children}
		</SocketStateContext.Provider>
	);
};

export const socket: Socket<ServerEvents, ClientEvents> = io({
	path: "/gameWs",
	reconnectionDelay: 50
});

