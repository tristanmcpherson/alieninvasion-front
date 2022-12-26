import React, { useContext, useState } from "react";
import { IGameState } from "./Models";

export type GameStateContextValue = [
	gameState: IGameState,
	setGameState: React.Dispatch<React.SetStateAction<IGameState>>
];
export const InitialGameState: Readonly<IGameState> = Object.freeze({ tasks: [], currentPlayer: null });
export const GameStateContext = React.createContext<GameStateContextValue>([{...InitialGameState}, () => { }]);

export const GameStateProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
	return <GameStateContext.Provider value={useState<IGameState>({...InitialGameState})}>
		{children}
	</GameStateContext.Provider>
};

export const useGameState = () => useContext(GameStateContext);