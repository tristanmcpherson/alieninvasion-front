import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Faction, IGameState, ILobby, IPlayer, ITask } from "../core/Models";
import { RootState } from "../store";

export const gameStateSlice = createSlice({
    name: 'gameState',
    // separate gamestate from gameconfig and ui config
    initialState: {
        currentPlayerId: null, 
        tasks: [], 
        gameConfig: { numberOfFartians: 1 }, 
        shownFaction: false 
    } as IGameState,
    reducers: {
        resetGame: (state) => {
            state.lobby = undefined;
            state.currentPlayerId = null;
            state.tasks = [];
        },
        createLobby: (state, action: PayloadAction<string>) => {
            state.lobby = { _id: action.payload, players: [] };
        },
        setLobby: (state, action: PayloadAction<ILobby>) => {
            state.lobby = action.payload;
        },
        setFartianCount: (state, action: PayloadAction<number>) => {
            state.gameConfig.numberOfFartians = action.payload;
        },
        setCurrentPlayer: (state, action: PayloadAction<string>) => {
            // process reconnect
            if (state.lobby && state.currentPlayerId) {
                const current = state.lobby.players.find(player => player._id === state.currentPlayerId);
                if (current) {
                    current._id = action.payload;
                }
            }

            state.currentPlayerId = action.payload;
        },
        setPlayerFaction: (state, action: PayloadAction<Faction>) => {
            if (state.lobby) {
                const currentPlayer = state.lobby.players.find(player => player._id === state.currentPlayerId);
                if (currentPlayer) {
                    currentPlayer.faction = action.payload;
                }
            }
        },
        addPlayer: (state, action: PayloadAction<IPlayer>) => {
            if (state.lobby) {
                state.lobby.players.push(action.payload);
            }
        },
        removePlayer: (state, action: PayloadAction<string>) => {
            if (state.lobby) {
                state.lobby.players = state.lobby?.players.filter(players => players._id !== action.payload);
            }
        },
        changeCharacter: (state, action: PayloadAction<{ playerId: string, newCharacter: string }>) => {
            if (state.lobby) {
                const player = state.lobby.players.find(player => player._id === action.payload.playerId);
                if (player) {
                    player.character = action.payload.newCharacter;
                }
            }
        },
        addTasks: (state, action: PayloadAction<ITask[]>) => {
            state.tasks = action.payload.sort((a, b) => a.name.localeCompare(b.name));
        },
        completeTask: (state, action: PayloadAction<string>) => {
            const task = state.tasks.find(task => task.id === action.payload);
            if (task) {
                task.completed = true;
            }
        },
        sabotageTask: (state, action: PayloadAction<string>) => {
            const task = state.tasks.find(task => task.id === action.payload);
            if (task) {
                task.completed = false;
            }
        },
        setShownFaction: (state) => {
            state.shownFaction = true
        }
    }
});

export const { resetGame, createLobby, setLobby, setFartianCount, setCurrentPlayer, setPlayerFaction, removePlayer, addPlayer, changeCharacter, addTasks, completeTask, sabotageTask } = gameStateSlice.actions;

export const selectCurrentPlayer = (state: RootState) => state.gameState.lobby?.players.find(player => player._id === state.gameState.currentPlayerId);
export const selectLobby = (state: RootState) => state.gameState.lobby;
export const selectFartianCount = (state: RootState) => state.gameState.gameConfig.numberOfFartians;
export const selectTasks = (state: RootState) => state.gameState.tasks;
export const selectShownFaction = (state: RootState) => state.gameState.shownFaction

export default gameStateSlice.reducer;