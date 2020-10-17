import React from 'react'
import { render } from "react-dom"

import { fontLoader } from '../styles'

import { configureStore } from '../store'
import Root from './root'

const initialState = (window as any).initialReduxState
const store = configureStore(initialState)

fontLoader()
render(<Root store={store}/>, document.getElementById('root'))
