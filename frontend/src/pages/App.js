import React, { useState } from "react";
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import './App.css';

import Home from "./Home.js";
import Login from './Login.js';
import Dashboard from './Dashboard.js';
import EmailVerify from './EmailVerify.js';
import Quiz from './Quiz.js';
import Error404 from './Error404.js';
import Workspace from './Workspace.js';
import About from './About.js';
import ShareStylesheet from './ShareStylesheet.js';

import {ThemeProvider} from "styled-components";
import { GlobalStyles } from "../components/GlobalStyles.js";
import { lightTheme, darkTheme } from "../components/Theme.js"
import NightModeToggler from "../components/NightModeToggler.js";

/**
 * Wrapper component for the entire app.
 */
function App () {
    const [theme, setTheme] = useState('light');

    const themeToggler = () => {
        theme === 'light' ? setTheme('dark') : setTheme('light')
    }
    let button = <NightModeToggler onClick={themeToggler} ifNightMode={theme === 'light' ? false: true}/>

    const router =
        <BrowserRouter>
                <Switch>
                    <Route exact path = "/" render={(props) =>  <Home {...props} nightModeButton={button}/>} />
                    <Route exact path = "/login" render={(props) =>  <Login {...props} nightModeButton={button}/>} />
                    <Route exact path = "/workspace/:workspaceId" render={(props) =>  <Workspace {...props} nightModeButton={button}/>} />
                    <Route exact path = "/dashboard" render={(props) =>  <Dashboard {...props}  nightModeButton={button}/>} />
                    <Route exact path = "/quiz/:workspaceId" render={(props) =>  <Quiz {...props}  nightModeButton={button}/>} />
                    <Route exact path = "/verify" component ={EmailVerify} />
                    <Route exact path = "/about" component ={About} />
                    <Route exact path = "/share/:workspaceId/:stylesheetId" component ={ShareStylesheet} />
                    <Route exact path = "/404" component ={Error404} />
                    {/* makes everything else go to 404 */}
                    <Route component ={Error404} />
                </Switch>
        </BrowserRouter>;

    return (
        <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
            <>
            <GlobalStyles/>
            {router}
            </>
        </ThemeProvider>
    );
}

export default App;
