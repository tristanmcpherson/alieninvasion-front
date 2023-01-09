import { configureStore } from "@reduxjs/toolkit";
import { IGameState } from "./core/Models";
import gameState, { initialGameState } from "./slices/GameSlice";

export const loadState = (): Partial<IGameState> => {
    try {
        const serializedState = localStorage.getItem("state");
        if (serializedState == null) {
            return {};
        }
        return JSON.parse(serializedState) as Partial<typeof store.getState>;
    } catch (err) {
        console.log(err);
        return {};
    }
};

export const saveState = (state: Partial<IGameState>) => {
    try {
        const serializedState = JSON.stringify(state);
        localStorage.setItem("state", serializedState);
    } catch (err) {
        console.log(err);
    }
};

const persistedState = loadState();
console.log("Old state: " + JSON.stringify(persistedState));
const preloadedState = { gameState: { ...initialGameState, ...persistedState }};
console.log("Preloaded state: " + JSON.stringify(preloadedState));

export const store = configureStore({
    reducer: {
        gameState
    },
    preloadedState: preloadedState
});

store.subscribe(() => {
    const state = store.getState();
    const currentLobby = state.gameState.lobby;
    saveState({
        currentPlayerId: state.gameState.currentPlayerId,
        lobby: currentLobby ? { ...currentLobby, players: [] } : undefined,
        shownFaction: state.gameState.shownFaction
    });
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch