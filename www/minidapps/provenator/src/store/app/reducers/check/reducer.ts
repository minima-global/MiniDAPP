import { ActionProps, CheckActionTypes, CheckProps } from '../../../types'

const initialState: CheckProps = {
  data: {
      isIn: false,
      block: ''
  }
}

export const reducer = (state: CheckProps = initialState, action: ActionProps): CheckProps => {
  console.log("Axtion: ", action.type)
  switch (action.type) {
    case CheckActionTypes.CHECK_SUCCESS:
    case CheckActionTypes.CHECK_FAILURE: {
      const data = (action.payload as CheckProps)
      console.log(data)
      return {...state, ...data}
    }
    default:
      return state
  }
}
