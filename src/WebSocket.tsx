import { Socket, io } from "socket.io-client";
import { ITask, ILobby } from "./Models";

const host = window.location.hostname;
const socketUrl = `wss://${host}`;


export interface SharedEvents {
    assemble: () => void;
    updateTaskStatus: (task: ITask) => void;
    ping: () => void;
}

export interface ClientEvents extends SharedEvents {
    joinLobby: (lobbyId: string) => void;
    createLobby: () => void;
}

export interface ServerEvents extends SharedEvents {
    lobbyJoined: (lobby: ILobby, tasks: ITask[]) => void;
}

export const socket: Socket<ServerEvents, ClientEvents> = io(socketUrl, {
    reconnectionDelay: 50
});