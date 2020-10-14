import * as React from 'react'
import { connect } from 'react-redux'
import Markdown from 'react-markdown'

import { ApplicationState } from '../../store'
import { get } from '../../utils/list'

import { Blockchain } from '../../config/strings'

interface InfoProps {
  status: string
}

const info = (props: InfoProps) => {

  //console.log("status", props.status)

  return (
      <div>
        <h2>{Blockchain.heading}</h2>
        <p>
            <Markdown escapeHtml={false} source={props.status} />
        </p>
      </div>
  )
}

const mapStateToProps = (state: ApplicationState): InfoProps => {
    return { status: state.chainInfo.data.status }
}

export const BlockchainInfo = connect<InfoProps, {}, {}, ApplicationState>(
  mapStateToProps
)(info)
