export interface ITask {
    id: string,
    name?: string,
    description?: string,
    completed?: boolean
}

export interface ILobby {
    // id of room to be used with socketio
    _id: string
    players: Array<string>
}

export interface IGameState {
    lobby?: ILobby,
    tasks: Array<ITask>
}