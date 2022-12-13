import { Socket, io } from "socket.io-client";
import { ITask, ILobby, IPlayer } from "./Models";

const host = window.location.hostname;
const socketUrl = `wss://${host}`;

export interface SharedEvents {
    assemble: () => void;
    updateTaskStatus: (task: ITask) => void;
    ping: () => void;
}

export interface ClientEvents extends SharedEvents {
    joinLobby: (lobbyId: string, name: string) => void;
    createLobby: (name: String) => void;
}

export interface ServerEvents extends SharedEvents {
    lobbyJoined: (lobby: ILobby, player: IPlayer) => void;
	lobbyLeft: (playerId: string) => void;
    startGame: (tasks: ITask[]) => void;
    characterSelected: (player: IPlayer) => void;
}


export const socket: Socket<ServerEvents, ClientEvents> = io(socketUrl, {
    path: "/gameWs",
    reconnectionDelay: 50
});