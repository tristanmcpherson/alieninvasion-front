import { IGameConfig } from "./WebSocket"

export interface ITask {
    id: string,
    name: string,
    description?: string,
    completed?: boolean
}

export interface ILobby {
    // id of room to be used with socketio
    _id: string
    players: Array<IPlayer>
}

// gamestate should be nullable instead of lobby, etc being nullable...
export interface IGameState {
    lobby?: ILobby,
    tasks: Array<ITask>,
    // ???, questioning this now lol
    // utilize store instead of socket directly
	currentPlayerId: string|null,
    gameConfig: IGameConfig,
    shownFaction: boolean
}

export const Factions = ["crewmate", "fartian"] as const;
export type Faction = typeof Factions[number];
export interface IPlayer {
	_id: string,
	name: string,
	character: string,
    faction: Faction
}

export interface ICharacter {
    _id: string,
    name: string,
    title: string,
    description: string
}