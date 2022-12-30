import { useEffect } from 'react';
import { ICardProps } from './Card';
import ChooseName from './ChooseName';
import { socket } from '../core/WebSocket';
import { useNavigate } from 'react-router-dom';
import Dialog from './Dialog';
import { setLobby } from '../slices/GameSlice';
import { useAppDispatch } from '../hooks';

const CreateLobbyDialog = (props: ICardProps) => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();

	const createLobby = (nickname: string) => {
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

			dispatch(setLobby(lobby));

			navigate({ pathname: "lobby" })
		});

		return () => {
			socket.off("lobbyJoined");
		}
	}, [navigate, dispatch])

	return <Dialog {...props}title={"Create Lobby"}>
		<ChooseName buttonText={"CREATE LOBBY"} handleNicknameChanged={createLobby}></ChooseName>
	</Dialog>
};

export default CreateLobbyDialog;