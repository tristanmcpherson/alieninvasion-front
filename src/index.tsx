import React, { createRef } from 'react';
import ReactDOM from 'react-dom/client';
import {
	BrowserRouter,
	createBrowserRouter,
	Route,
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
import { animated, useTransition } from 'react-spring';
const Game = React.lazy(() => import("./Game"));
const Lobby = React.lazy(() => import("./Lobby"));

const withLoader = (Component: React.ComponentType) =>
	<React.Suspense fallback={<Loader open={true} />}>
		<Component></Component>
	</React.Suspense>

const routes = [
	{
		path: "/",
		element: <App></App>,
		nodeRef: createRef<HTMLDivElement>()
	},
	{
		path: "/game",
		// loader instead of ...
		element: withLoader(Game),
		nodeRef: createRef<HTMLDivElement>()
	},
	{
		path: "/lobby",
		element: withLoader(Lobby),
		nodeRef: createRef<HTMLDivElement>()
	}
];

const theme = createTheme({
	palette: {
		mode: 'dark',
	},
});

const Index = () => {
	const location = useLocation();
	const outlet = useOutlet();
	const { nodeRef } = routes.find((route) => route.path === location.pathname) ?? {}

	const transitions = useTransition(location, {
		key: (location: Location) => location.pathname,
		from: { opacity: 0 },
		enter: { opacity: 1 }
	})

	if (!nodeRef) {
		return <>OOPS</>;
	}

	return (
		<ThemeProvider theme={theme}>
			<GameStateProvider>
				<CssBaseline />
				<div className="App">
					{transitions((props, item) => (
						<animated.div key={item.pathname} style={props}>
							<div ref={nodeRef} className="page">
								{outlet}
							</div>
						</animated.div>
					))}
				</div>
			</GameStateProvider>
		</ThemeProvider>
	);
};

const router = createBrowserRouter([
	{
		path: '/',
		element: <Index />,
		children: routes,
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
