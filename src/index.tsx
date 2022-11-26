import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
  Route,
} from "react-router-dom";
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ThemeProvider } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import red from '@mui/material/colors/red';
import CssBaseline from '@mui/material/CssBaseline';


const Ws = React.lazy(() => import("./WebSocket"))

const router = createBrowserRouter([
  {
    path: "/",
    element: <App></App>
  },
  {
    path: "/websocket",
    element: <React.Suspense fallback={<>...</>}>
      <Ws/>
    </React.Suspense>

  }
]);

const theme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
