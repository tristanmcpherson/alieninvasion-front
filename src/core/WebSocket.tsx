import { Socket, io } from "socket.io-client";
import { ITask, ILobby, IPlayer, Faction } from "./Models";

export interface IGameConfig {
	numberOfFartians: number;
	// room name configuration
	// store in local storage aggressively
}

export interface SharedEvents {
	assemble: () => void;
	ping: () => void;
}

export interface ClientEvents extends SharedEvents {
	joinLobby: (lobbyId: string, name: string) => void;
	startGame: (gameConfig: IGameConfig) => void;
	leaveGame: () => void;
	rejoinLobby: (lastPlayerId: string, lobbyId: string) => void;
	createLobby: (name: string) => void;
	characterSelected: (characterId: string) => void;
	updateTaskStatus: (task: Partial<ITask>) => void;
}

export interface ServerEvents extends SharedEvents {
	lobbyJoined: (lobby: ILobby, player: IPlayer) => void;
	lobbyLeft: (playerId: string) => void;
	rejoinGame: (lobby: ILobby, tasks: ITask[], faction: Faction|null) => void;
	startGame: (tasks: ITask[], faction: Faction) => void;
	characterSelected: (playerId: string, characterId: string) => void;
	updateTaskStatus: (task: ITask) => void;
}

export const socket: Socket<ServerEvents, ClientEvents> = io({
	path: "/gameWs",
	reconnectionDelay: 250,
	reconnectionDelayMax: 250
});

