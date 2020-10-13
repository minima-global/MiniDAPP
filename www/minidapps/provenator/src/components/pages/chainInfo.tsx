import * as React from 'react'
import { connect } from 'react-redux'
import Markdown from 'react-markdown'

import { ApplicationState } from '../../store'
import { get } from '../../utils/list'

import { Blockchain } from '../../config/strings'

interface InfoProps {
  contractAddress: string
}

const info = (props: InfoProps) => {

  return (
      <div>
        <h2>{Blockchain.heading}</h2>
        <Markdown escapeHtml={false} source={props.contractAddress} />
      </div>
  )
}

const mapStateToProps = (state: ApplicationState): InfoProps => {
    return { contractAddress: state.chainInfo.data.fileContractAddress }
}

export const BlockchainInfo = connect<InfoProps, {}, {}, ApplicationState>(
  mapStateToProps
)(info)
