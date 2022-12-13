import { Typography, Divider } from "@mui/material";
import React, { ReactNode } from "react";
import { withCard } from "./Card";

const Dialog = ({ title, children }: { title: string, children: ReactNode }) => {
	return <>
		<Typography fontSize={18} textAlign={"start"} ml={4} mb={1}>{title}</Typography>
		<Divider></Divider>
		{children}
	</>;
};

export default withCard(Dialog);