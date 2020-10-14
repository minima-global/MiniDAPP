import React, { useRef, useState, useEffect } from 'react'
import { connect } from 'react-redux'

import Markdown from 'react-markdown'

import { status as chainStatus } from '../../store/app/blockchain/actions'

import {
    ApplicationState,
    AppDispatch
} from '../../store/types'

import { Blockchain } from '../../config/strings'

interface StatusProps {
  status: string
}

interface StatusDispatchProps {
  getStatus: () => void
}

type Props =  StatusProps & StatusDispatchProps

const status = (props: Props) => {

  let isFirstRun = useRef(true)
  let [status, setStatus] = useState('')

  useEffect(() => {

      if ( isFirstRun.current ) {

        isFirstRun.current = false
        props.getStatus()
        //setInterval(props.getStatus, 3000)

      } else {
          setStatus(props.status)
      }

  }, [props.status])

  return (
      <div>
        <h2>{Blockchain.heading}</h2>
        <p>
            <Markdown escapeHtml={false} source={props.status} />
        </p>
      </div>
  )
}

const mapStateToProps = (state: ApplicationState): StatusProps => {
    return { status: state.chainInfo.data.status }
}

const mapDispatchToProps = (dispatch: AppDispatch): StatusDispatchProps => {
  return {
    getStatus: () => dispatch(chainStatus())
  }
}

export const BlockchainInfo = connect<StatusProps, StatusDispatchProps, {}, ApplicationState>(
  mapStateToProps,
  mapDispatchToProps
)(status)
