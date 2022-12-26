import { useEffect } from 'react';
import { ICardProps } from './Card';
import ChooseName from './ChooseName';
import { useGameState, InitialGameState } from '../core/GameService';
import { socket } from './WebSocket';
import { useNavigate } from 'react-router-dom';
import Dialog from './Dialog';

const CreateLobbyDialog = (props: ICardProps) => {
	const navigate = useNavigate();
	const [, setGameState] = useGameState();

	const createLobby = (nickname: string) => {
		setGameState({...InitialGameState});
		socket.emit("createLobby", nickname);
	}

	useEffect(() => {
		// we can assume the player returned by this call is the calling player
		// but we can check anyways
		socket.on("lobbyJoined", (lobby, player) => {
			if (player._id !== socket.id) {
				console.warn("Joined lobby in create lobby screen but not current player");
				return;
			}

			setGameState({
				tasks: [],
				lobby: lobby,
				currentPlayer: player
			});

			navigate({ pathname: "lobby" })
		});

		return () => {
			socket.off("lobbyJoined");
		}
	}, [setGameState, navigate])

	return <Dialog {...props}title={"Create Lobby"}>
		<ChooseName buttonText={"CREATE LOBBY"} handleNicknameChanged={createLobby}></ChooseName>
	</Dialog>
};

export default CreateLobbyDialog;