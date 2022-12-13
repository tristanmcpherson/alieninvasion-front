import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useSpringRef, useSpring, config, useChain, useTransition, animated } from 'react-spring';
import CreateLobbyDialog from './CreateLobbyDialog';
import Dialog from './Dialog';
import styles from './Main.module.css';
import { socket } from './WebSocket';

const AnimatedTypography = animated(Typography);

function App() {
	const [showJoinDialog, setShowJoinDialog] = useState<boolean>(false);
	const [showCreateDialog, setShowCreateDialog] = useState<boolean>(false);
	const [lobbyCode, setLobbyCode] = useState<string>("");
	const [nickname, setNickname] = useState<string>("");

	const handleLobbyJoinClick = () => {
		setShowJoinDialog(false);
		socket.emit("joinLobby", lobbyCode, nickname);
	};

	const createLobby = async () => {
		setShowCreateDialog(true);
	};


	const stopClick = (event: React.MouseEvent<any>) => {
		event.stopPropagation();
		event.preventDefault();
	};

	const createButton = <Button className={styles.transformButton} variant="outlined" color="success" size="large" onClick={() => createLobby()}>
		CREATE LOBBY
	</Button>;

	const joinButton = <Button className={styles.transformButton} variant="outlined" size="large" onClick={() => setShowJoinDialog(true)}>
		JOIN LOBBY
	</Button>;

	const buttons = [
		createButton, joinButton
	];

	const fadeInApi = useSpringRef();
	const fadeIn = useSpring({
		ref: fadeInApi,
		from: { opacity: 0 },
		to: { opacity: 1 },
		config: config.slow,
	});

	const logoTransitionApi = useSpringRef();
	const logoTransition = useSpring({
		ref: logoTransitionApi,
		from: { opacity: 0, x: -600 },
		to: { opacity: 1, x: 0 },
		config: config.gentle
	});

	useChain([logoTransitionApi, fadeInApi], [0, 0.5]);

	const transition = useTransition(buttons, {
		key: (b: JSX.Element) => buttons.indexOf(b),
		trail: 400 / buttons.length,
		from: { opacity: 0, scale: 0 },
		enter: { opacity: 1, scale: 1 },
		leave: { opacity: 0, scale: 0 },
	})

	const getLobbyError = (): [boolean, string | null] => {
		if (lobbyCode.length === 0) {
			return [false, null];
		}

		if (lobbyCode.length !== 6) {
			return [true, "Needs to be 6 characters in length"];
		}
		return [false, null];
	};
	const [lobbyError, lobbyMessage] = getLobbyError();

	const validate = (nickname: string): [error: boolean, message: string | null] => {
		if (nickname.length > 24) {
			return [true, "Must be less than 24 characters"]
		}

		return [false, null];
	}
	const [nicknameError, nicknameMessage] = validate(nickname);

	return (
		<div className={styles.header}>
			<Box marginTop={{ xs: 8, md: 24 }}>
				<Stack margin={{ xs: 4, md: 8 }}>
					<AnimatedTypography style={logoTransition} fontSize={96} sx={{ fontFamily: 'Under Authority' }} variant="h3">Fartian</AnimatedTypography>
					<AnimatedTypography style={fadeIn} fontSize={32} sx={{ fontFamily: 'Bebas', letterSpacing: "20px", textIndent: "20px", transform: "scale(1, 1.5)" }} variant="h3">INVASION</AnimatedTypography>
					<Stack sx={{ margin: { xs: 8, md: 12 } }} direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 4, md: 12 }} display={"flex"} justifyContent={"center"}>
						{transition((style, button) => (
							<animated.div style={style}>{button}</animated.div>
						))}
					</Stack>
				</Stack>
			</Box>
			<CreateLobbyDialog show={showCreateDialog} onClick={() => setShowCreateDialog(false)}></CreateLobbyDialog>
			<Dialog show={showJoinDialog} title='Join Lobby' onClick={() => setShowJoinDialog(false)} >
				<Stack direction={"column"} spacing={2} padding={4} pb={3} onClick={stopClick}>
					<TextField
						required
						id="outlined-required"
						label="Lobby Code"
						error={lobbyError}
						helperText={lobbyMessage}
						value={lobbyCode}
						onChange={(event) => {
							setLobbyCode(event.target.value.toUpperCase());
						}}
					/>
					<TextField
						required
						id="outlined-required"
						label="Nickname"
						error={nicknameError}
						helperText={nicknameMessage}
						value={nickname}
						onKeyDown={(event) => {
							if (event.key === "Enter") {
								if (!nicknameError && nickname.length !== 0 && !lobbyError && lobbyCode.length !== 0) {
									handleLobbyJoinClick()
								}
							}
						}}
						onChange={(event) => {
							setNickname(event.target.value);
						}}
					/>
					<Button 
						focusRipple={true}
						variant="outlined" 
						type="submit" 
						disabled={lobbyError || lobbyCode.length === 0 || nicknameError || nickname.length === 0} 
						onClick={handleLobbyJoinClick}>JOIN</Button>
				</Stack>
			</Dialog>
		</div>
	);
}

export default App;
