import React, { createRef } from 'react';
import ReactDOM from 'react-dom/client';
import {
	createBrowserRouter,
	RouteObject,
	RouterProvider,
	useLocation,
	useOutlet,
} from "react-router-dom";
import App from './Main';
import reportWebVitals from './reportWebVitals';
import { ThemeProvider } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { GameStateProvider } from './GameService';
import { Loader } from './Loader';
import CssBaseline from '@mui/material/CssBaseline';
import './index.css';
import { animated, useTransition } from '@react-spring/web';
import { SocketStateProvider } from './WebSocket';
import { ConnectionComponent } from './ConnectionComponent';
const Game = React.lazy(() => import("./Game"));
const Lobby = React.lazy(() => import("./Lobby"));

const withLoader = (Component: React.ComponentType) =>
	<React.Suspense fallback={<Loader open={true} />}>
		<Component></Component>
	</React.Suspense>

const routes: RouteObject[] = [
	{
		path: "/",
		element: <App></App>,
		//nodeRef: createRef<HTMLDivElement>()
	},
	{
		path: "/game",
		// loader instead of ...
		element: withLoader(Game),
		//nodeRef: createRef<HTMLDivElement>()
	},
	{
		path: "/lobby",
		element: withLoader(Lobby),
		//nodeRef: createRef<HTMLDivElement>()
	}
];

const theme = createTheme({
	palette: {
		mode: 'dark',
	},
	components: {
		MuiCssBaseline: {
		  styleOverrides: {
			body: {
			  scrollbarColor: "#6b6b6b #2b2b2b",
			  "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
				backgroundColor: "#2b2b2b",
			  },
			  "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
				borderRadius: 8,
				backgroundColor: "#6b6b6b",
				minHeight: 24,
				border: "3px solid #2b2b2b",
			  },
			  "&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus": {
				backgroundColor: "#959595",
			  },
			  "&::-webkit-scrollbar-thumb:active, & *::-webkit-scrollbar-thumb:active": {
				backgroundColor: "#959595",
			  },
			  "&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover": {
				backgroundColor: "#959595",
			  },
			  "&::-webkit-scrollbar-corner, & *::-webkit-scrollbar-corner": {
				backgroundColor: "#2b2b2b",
			  },
			},
		  },
		},
	  },
});

const Index = () => {
	const location = useLocation();
	const outlet = useOutlet();
	//const { nodeRef } = routes.find((route) => route.path === location.pathname) ?? {}

	const transitions = useTransition(location, {
		key: (location: Location) => location.pathname,
		from: { opacity: 0 },
		enter: { opacity: 1 }
	});

	// if (!nodeRef) {
	// 	return <>OOPS</>;
	// }

	return (
		<ThemeProvider theme={theme}>
			<SocketStateProvider>
				<GameStateProvider>
					<ConnectionComponent>
						<CssBaseline />
						<div className="App">
							{transitions((props, item) => (
								<animated.div key={item.pathname} style={props}>
									<div className="page">
										{outlet}
									</div>
								</animated.div>
							))}
						</div>
					</ConnectionComponent>
				</GameStateProvider>
			</SocketStateProvider>
		</ThemeProvider>
	);
};

const router = createBrowserRouter([
	{
		path: '/',
		element: <Index />,
		children: routes
	},
]);


const root = ReactDOM.createRoot(
	document.getElementById('root') as HTMLElement
);

root.render(<RouterProvider router={router} />);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
