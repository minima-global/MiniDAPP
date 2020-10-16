import {
    ApplicationState,
    ActionProps,
    PayloadProps,
    AppDispatch,
    CheckActionTypes,
    CheckData,
} from '../../types'
import { write } from '../../actions'

import { File } from '../../../config'

export const initialise = () => {
  return async (dispatch: AppDispatch) => {
    const initData: CheckData = {
        in: false,
        block: ''
    }
    await dispatch(write({data: initData})(CheckActionTypes.CHECK_INIT))
  }
}
