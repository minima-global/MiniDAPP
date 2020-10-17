import React from 'react'
import Markdown from 'react-markdown'
import { Home as HomeConfig } from '../../config'

export const Home = () => {

  return (
    <React.Fragment>
        <Markdown escapeHtml={false} source={HomeConfig.info} />
    </React.Fragment>
  )
}
