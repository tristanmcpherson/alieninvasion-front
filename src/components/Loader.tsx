import React from "react";
import { Backdrop, CircularProgress } from "@mui/material"

export interface ILoaderProps {
	open: boolean,
	handleClose?: () => void
}

export const Loader = (props: ILoaderProps) => {
	return <Backdrop
		sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
		open={props.open}
		onClick={props.handleClose}
	>
		<CircularProgress color="inherit" />
	</Backdrop>
}