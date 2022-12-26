import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

export interface IChooseNameProps {
	buttonText: string;
	handleNicknameChanged?: (nickname: string) => void;
}

const ChooseName = (props: IChooseNameProps) => {
	const [nickname, setNickname] = useState<string>("");

	const validate = (nickname: string): [error: boolean, message: string | null] => {
		if (nickname.length > 24) {
			return [true, "Must be less than 24 characters"]
		}

		return [false, null];
	}
	const [error, message] = validate(nickname);

	return <Stack direction={"column"} spacing={2.5} pt={4} pl={4} pr={4} pb={3}>
		<TextField
			label="Nickname"
			error={error}
			helperText={message}
			onChange={(event) => {
				setNickname(event.target.value)
			}}
			value={nickname}
			onKeyDown={(ev) => {
				if (ev.key === "Enter") {
					console.log("enter pressed");
					if (!error && nickname.length !== 0) { props.handleNicknameChanged?.(nickname) }
				}
			}}></TextField>
		<Button focusRipple={true} variant="outlined" disabled={error || nickname.length === 0} onClick={() => props.handleNicknameChanged?.(nickname)}>
			{props.buttonText}
		</Button>
	</Stack>

};

export default ChooseName;