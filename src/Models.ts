export interface ITask {
    id: string,
    name?: string,
    description?: string,
    completed?: boolean
}

export interface ILobby {
    // id of room to be used with socketio
    _id: string
    players: Array<IPlayer>
}

export interface IGameState {
    lobby?: ILobby,
    tasks: Array<ITask>,
	currentPlayer: IPlayer|null
}

export interface IPlayer {
	_id: string,
	name: string,
	character: string
}

export interface ICharacter {
    _id: string,
    name: string,
    description: string
}