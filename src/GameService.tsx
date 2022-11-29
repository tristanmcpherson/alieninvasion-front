import React, { useContext, useState } from "react";
import { IGameState } from "./Models";

export type GameStateContextValue = [
    gameState: IGameState,
    setGameState: React.Dispatch<React.SetStateAction<IGameState>>
]
export const GameStateContext = React.createContext<GameStateContextValue>([{tasks: []}, () => {}]);

export const GameStateProvider: React.FC<{ children: JSX.Element[] }> = ({ children }) => {
    return <GameStateContext.Provider value={useState<IGameState>({ tasks: [] })}>
        {children}
    </GameStateContext.Provider>
}

export const useGameState = () => useContext(GameStateContext);