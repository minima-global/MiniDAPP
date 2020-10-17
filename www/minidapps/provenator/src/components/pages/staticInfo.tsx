import React from 'react'
import { connect } from 'react-redux'
import Markdown from 'react-markdown'

import Grid from '@material-ui/core/Grid'

import { ApplicationState, InfoProps, InfoTypes } from '../../store/types'

interface StateProps {
  type: InfoTypes
}

type Props = InfoProps & StateProps

const appInfo = (props: Props) => {

    return (
        <React.Fragment>
            <h2>{props.title}</h2>
            <Markdown escapeHtml={false} source={props.data} />
        </React.Fragment>
    )
}

const mapStateToProps = (state: ApplicationState, ownProps: StateProps): InfoProps => {
  switch (ownProps.type) {
    case InfoTypes.HOME:
      return { title: state.info.data.home.title, data: state.info.data.home.data }
    case InfoTypes.ABOUT:
      return { title: state.info.data.about.title, data: state.info.data.about.data }
    case InfoTypes.HELP:
      return { title: state.info.data.help.title, data: state.info.data.help.data }
    case InfoTypes.FAQ:
      return { title: state.info.data.faq.title, data: state.info.data.faq.data }
    case InfoTypes.CONTACT:
      return { title: state.info.data.contact.title, data: state.info.data.contact.data }
    default:
      return { title: state.info.data.home.title, data: state.info.data.home.data }
  }
}

export const Info = connect<InfoProps, {}, StateProps, ApplicationState>(
  mapStateToProps
)(appInfo)
