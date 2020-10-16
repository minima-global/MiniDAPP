import { ApplicationState, ActionProps, PayloadProps, AppDispatch, TransactionActionTypes, TxData } from '../../types'
import { write } from '../../actions'

export const initialise = () => {
  return async (dispatch: AppDispatch) => {
    const initData: TxData = {
        id: "",
        summary: "",
        time: ""
    }
    await dispatch(write({data: initData})(TransactionActionTypes.TRANSACTION_INIT))
  }
}
