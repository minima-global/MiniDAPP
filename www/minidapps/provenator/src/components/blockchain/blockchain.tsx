import React from 'react'
import { connect } from 'react-redux'

import { init, addAddress } from '../../store/app/blockchain/actions'

import { ApplicationState, AppDispatch } from '../../store/types'

interface ChainInitDispatchProps {
    handleInit: () => void
    handleAddress: () => void
}

const defaultProps: ChainInitDispatchProps = {
    handleInit: () => {},
    handleAddress: () => {}
}

const chainSet = ( props: ChainInitDispatchProps = defaultProps ) => {

    props.handleInit()
    props.handleAddress()

    return null
 }

 const mapDispatchToProps = (dispatch: AppDispatch): ChainInitDispatchProps => {
   return {
     handleInit: () => dispatch(init()),
     handleAddress: () => dispatch(addAddress())
   }
 }

 export const ChainInit = connect<{}, ChainInitDispatchProps, {}, ApplicationState>(
   null,
   mapDispatchToProps
 )(chainSet)
