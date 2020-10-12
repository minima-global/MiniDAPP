import React from 'react'
import { render } from "react-dom"

import { configureStore } from '../store'
import Root from './root'

const initialState = (window as any).initialReduxState
const store = configureStore(initialState)

render(<Root store={store}/>, document.getElementById('root'))
