import { ActionProps, TransactionActionTypes, TransactionProps } from '../../../types'

const initialState: TransactionProps = {
  data: {
    key: "",
    summary: "",
    time: ""
  }
}

export const reducer = (state: TransactionProps = initialState, action: ActionProps): TransactionProps => {

  //console.log( action )
  switch (action.type) {
    case TransactionActionTypes.TRANSACTION_INIT: {
      const data = (action.payload as TransactionProps)
      return data
    }
    case TransactionActionTypes.TRANSACTION_PENDING:
    case TransactionActionTypes.TRANSACTION_SUCCESS:
    case TransactionActionTypes.TRANSACTION_FAILURE: {
      const data = (action.payload as TransactionProps)
      return {...state, ...data}
    }
    default:
      return state
  }
}
