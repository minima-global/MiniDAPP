import { ActionProps, GetActionTypes, GetProps } from '../../../types'

const initialState: GetProps = {
  data: []
}

export const reducer = (state: GetProps = initialState, action: ActionProps): GetProps => {

  switch (action.type) {
    case GetActionTypes.GET_FAILURE:
    case GetActionTypes.GET_INIT: {
      const data = (action.payload as GetProps)
      return data
    }
    case GetActionTypes.GET_SUCCESS: {
      const data = (action.payload as GetProps)
      return {...state, ...data}
    }
    default:
      return state
  }
}
