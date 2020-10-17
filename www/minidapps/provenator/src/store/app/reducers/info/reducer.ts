import { Reducer } from 'redux'
import { InfoPageProps } from '../../../types'
import { About, Help, Home, Faq, Contact } from '../../../../config/strings'

const initialState: InfoPageProps = {
  data: {
      home: {
        title: Home.heading,
        data: Home.info
      },
    about: {
      title: About.heading,
      data: About.info
    },
    help: {
      title: Help.heading,
      data: Help.info
    },
    faq: {
      title: Faq.heading,
      data: Faq.info
    },
    contact: {
      title: Contact.heading,
      data: Contact.info
    }
  }
}

export const reducer: Reducer<InfoPageProps> = (state = initialState): InfoPageProps => {
  return state
}
