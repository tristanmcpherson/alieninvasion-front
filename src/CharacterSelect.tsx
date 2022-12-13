import { useState } from "react";
import { ICharacter } from "./Models";
import { Dialog } from '@mui/material';

export const CharacterSelect = ({ show } : { show: boolean }) => {
	const [character, setCharacter] = useState<ICharacter>();

	return <Dialog open={show}>
		<img src={`./images/${character}`} alt={character?.name}></img>
		
	</Dialog>;
};