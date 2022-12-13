import { Backdrop } from "@mui/material";
import React from "react";
import { FadeInPaper } from "./FadeInPaper";

export interface ICardProps {
	show?: boolean;
	onClick?: () => void;

}

export function withCard<T>(Component: React.ComponentType<T>) {
	return (props: T & ICardProps) => {
		return <Card {...props}>
			<Component {...props}></Component>
		</Card>
	};
};

export const Card = (props: ICardProps & { children?: JSX.Element | JSX.Element[] }) => {
	return <Backdrop
		onClick={props.onClick}
		sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
		open={props.show ?? true}>
		<FadeInPaper>
			{props.children}
		</FadeInPaper>
	</Backdrop>
}