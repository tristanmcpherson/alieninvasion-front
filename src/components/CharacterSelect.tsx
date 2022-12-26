import { useState } from "react";
import { ICharacter } from "../core/Models";
import { Box, Button, Collapse, Dialog, DialogActions, Divider, Paper, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2'
import { Characters, Icons } from './images/Images';
import { animated, config, useTrail, UseTrailProps } from "@react-spring/web";
import select from "./images/select.png";
import styles from "./CharacterSelect.module.css";

export const CharacterSelect = ({ show, onClose }: { show: boolean, onClose: (characterId: string | null) => void }) => {
	const [characterId, setCharacterId] = useState<string | null>(null);
	const currentCharacter = Characters.find(character => character._id === characterId);

	const fadeConfig: UseTrailProps = {
		from: { opacity: 0 },
		opacity: 1,
		delay: 200,
		config: config.molasses
	};

	const trails = useTrail(Characters.length, fadeConfig);

	const renderCharacter = (character: ICharacter) => {
		return <div onClick={() => setCharacterId(character._id)}>
			<img className={styles.characterImage} src={Icons.get(character._id)} width={90} height={90} alt={character?.name}></img>
		</div>
	}

	const AnimatedGrid = animated(Grid);

	return <Dialog open={show} onClose={() => onClose(characterId)} maxWidth="md">
		<Box p={2}>
			<Typography fontSize={24} textAlign={"start"} ml={4} mb={1}>Choose Your Character</Typography>
			<Divider></Divider>
			<Stack m={{ xs: 1, md: 5 }} spacing={4}>
				{/*  Reverse so that we can revert it back for mobile */}
				<Stack spacing={6} direction={{ xs: "column", md: "column" }}>
					<Stack mt={2} flex={1} justifyContent="space-evenly" alignSelf="flex-start" direction={'row'} spacing={0} sx={{ flexWrap: 'wrap', gap: 1 }}>
						{trails.map(({ opacity }, index) =>
							<AnimatedGrid className={styles.character + " " + styles.box + " " + (Characters[index]._id === characterId ? styles.selected : "")} key={Characters[index]._id} style={{ opacity }}>
								{renderCharacter(Characters[index])}
							</AnimatedGrid>
						)}

					</Stack>
					<Collapse in={!!currentCharacter}>
					<Stack direction="row" spacing={2} flex={1}>
						<img className={styles.selectedCharacter} width={300} height={300} src={characterId ? Icons.get(characterId) : select} alt={characterId ?? "Please select"}></img>
						<Divider />
						{currentCharacter && 
							<Box height="300px" display="flex" flexDirection="column">
								<Stack direction="row" spacing={1}>
									<Box fontSize="24px" fontWeight="200">{currentCharacter?.title}</Box>
									<Box fontSize="24px">{currentCharacter?.name}</Box>
								</Stack>
								
									<Paper
										component="div"
										sx={{
											height: '100%',
											//maxHeight: '180px',
											whiteSpace: 'wrap',
											overflowX: 'auto',
											my: 2,
											p: 1,
											bgcolor: (theme) =>
												theme.palette.mode === 'dark' ? '#101010' : 'grey.100',
											color: (theme) =>
												theme.palette.mode === 'dark' ? 'grey.300' : 'grey.800',
											border: '1px solid',
											borderColor: (theme) =>
												theme.palette.mode === 'dark' ? 'grey.800' : 'grey.300',
											borderRadius: 2,
											fontSize: '0.875rem',
											fontWeight: '700',
										}}
									>
										{currentCharacter.description}
									</Paper>
								
							</Box>}
					</Stack>
					</Collapse>
				</Stack>
			</Stack>
			<Divider></Divider>
		</Box>
		<DialogActions>
			<Button onClick={() => onClose(characterId)}>CHOOSE CHARACTER</Button>
		</DialogActions>
	</Dialog>;
};