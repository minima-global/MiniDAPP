import React from 'react'
import { Router } from 'react-router-dom'
import { Provider } from 'react-redux'
import { history } from '../utils/history'

import CssBaseline from '@material-ui/core/CssBaseline'
import { ThemeProvider } from '@material-ui/styles'

import { theme } from '../styles'
import { Main } from './pages/main'

const Root = ({ store }: any) => (
    <Provider store={store}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router history={history}>
            <Main />
          </Router>
        </ThemeProvider>
    </Provider>
);

export default Root
