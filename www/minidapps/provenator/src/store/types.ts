import { Action } from 'redux'
import { ThunkDispatch } from 'redux-thunk'

// Store stuff
export interface ApplicationState {
  chainInfo: ChainDataProps,
  info: InfoPageProps
  tx: TransactionProps
  data: GetProps
  check: CheckProps
}

export interface PayloadProps {
  data: object
}

export interface ActionProps extends Action {
  type: string
  payload: PayloadProps
}

export type AppDispatch = ThunkDispatch<ApplicationState, any, ActionProps>

// Blockchain info
export interface ChainDataProps extends PayloadProps {
  data: {
    scriptAddress: string
    status: string
  }
}

// Info (about etc.) stuff
export const enum InfoTypes {
  HOME = "home",
  ABOUT = "about",
  HELP = "help",
  FAQ = "faq",
  CONTACT = "contact"
}

export interface InfoPageProps extends PayloadProps {
  data: InfoData
}

export interface InfoProps {
  title: string
  data: string
}

export interface InfoData {
  home: InfoProps
  about: InfoProps
  help: InfoProps
  faq: InfoProps
  contact: InfoProps
}

// Get stuff
export interface Coin {
  hash: string
  block: string
}

export interface GetProps extends PayloadProps {
    data: Array<Coin>
}

// Check stuff
export interface CheckData {
  in: boolean
  block: string
}

export interface CheckProps extends PayloadProps {
  data: CheckData
}


//Tx stuff
export interface TxData {
  id: string
  summary: string
  time: string
}

export interface TransactionProps extends PayloadProps {
  data: TxData
}

// Extra info stuff
export interface FileProps {
    fileHash: string
}

export interface FileInfoProps {
    fileInfo: Array<FileProps>
}

// Action types
export const enum TransactionActionTypes {
  TRANSACTION_INIT = '@@TransactionActionTypes/TRANSACTION_INIT',
  TRANSACTION_PENDING = '@@TransactionActionTypes/TRANSACTION_PENDING',
  TRANSACTION_SUCCESS = '@@TransactionActionTypes/TRANSACTION_SUCCESS',
  TRANSACTION_FAILURE = '@@TransactionActionTypes/TRANSACTION_FAILURE'
}

export const enum ChainDataActionTypes {
  ADD_DATA = '@@ChainDataActionTypes/ADD_DATA'
}

export const enum CheckActionTypes {
  CHECK_INIT = '@@CheckActionTypes/CHECK_INIT',
  CHECK_SUCCESS = '@@CheckActionTypes/CHECK_SUCCESS',
  CHECK_FAILURE = '@@CheckActionTypes/CHECK_FAILURE'
}

export const enum GetActionTypes {
  GET_INIT = '@@GetActionTypes/GET_INIT',
  GET_SUCCESS = '@@GetActionTypes/GET_SUCCESS',
  GET_FAILURE = '@@GetActionTypes/GET_FAILURE'
}
