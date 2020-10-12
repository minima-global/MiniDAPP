import * as React from 'react'
import { connect } from 'react-redux'
import Markdown from 'react-markdown'

import { ApplicationState } from '../../store'
import { get } from '../../utils/list'

import { Blockchain } from '../../config/strings'

interface InfoProps {
  blockchain: object
}

const info = (props: InfoProps) => {

  const chainInfo = get(props.blockchain)

  return (
      <div>
        <h2>{Blockchain.heading}</h2>
        <Markdown escapeHtml={false} source={chainInfo} />
      </div>
  )
}

const mapStateToProps = (state: ApplicationState): InfoProps => {
  const propertiesList = {
      HexAccount: state.chainInfo.data.hexAccount,
      Account: state.chainInfo.data.account
  }
  const properties = {
    blockchain: propertiesList
  }
  return properties
}

export const BlockchainInfo = connect<InfoProps, {}, {}, ApplicationState>(
  mapStateToProps
)(info)
