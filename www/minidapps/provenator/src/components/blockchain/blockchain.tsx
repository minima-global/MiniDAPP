import React from 'react'
import { connect } from 'react-redux'

import { init } from '../../store/app/blockchain/actions'

import { ApplicationState, AppDispatch } from '../../store/types'

interface ChainInitDispatchProps {
    handleInit: () => void
}

const defaultProps: ChainInitDispatchProps = {
    handleInit: () => {}
}

const chainSet = ( props: ChainInitDispatchProps = defaultProps ) => {

    props.handleInit()
    return null
 }

 const mapDispatchToProps = (dispatch: AppDispatch): ChainInitDispatchProps => {
   return {
     handleInit: () => dispatch(init())
   }
 }

 export const ChainInit = connect<{}, ChainInitDispatchProps, {}, ApplicationState>(
   null,
   mapDispatchToProps
 )(chainSet)
