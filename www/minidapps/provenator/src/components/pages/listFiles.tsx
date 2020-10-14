import React, { useRef, useState, useEffect } from 'react'
import { connect } from 'react-redux'

import Markdown from 'react-markdown'
import { SimpleArrayRenderer } from '../simpleRenderer'

//import { getList }  from '../../utils'
import { getFiles } from '../../store/app/blockchain/actions'

import {
    ApplicationState,
    AppDispatch,
    GetProps
} from '../../store/types'

import { FormHelpers, Files, GeneralError, Remote } from '../../config'

import { themeStyles } from '../../styles'

interface FilesProps {
  files: []
}

interface FilesDispatchProps {
  getFiles: () => void
}

type Props =  FilesProps & FilesDispatchProps

const filesReader = (props: Props) => {

    //let isFirstRun = useRef(true)
    let [hashes, setHashes] = useState('')

    const themeClasses = themeStyles()

    useEffect(() => {

        /*if ( isFirstRun.current ) {

            isFirstRun.current = false*/
            props.getFiles()

          /* }

      else {

            /*console.log(props.files, props.files.length)
            let hashFiles = ""
            for ( let i = 0; i < props.files.length; i++ ) {
                console.log("oi: ", props.files[i])
                hashFiles += props.files[i] + "<br/>"
            }
            console.log(hashFiles)
            setHashes(hashFiles)

        }

    }, [props.files])*/
    },[])

    return (
      <div>
        <h2>{Files.heading}</h2>
        <hr />
        <p>
          <SimpleArrayRenderer data={props.files} />
        </p>
      </div>
    )
}

const mapStateToProps = (state: ApplicationState): FilesProps => {
  //console.log(state.orgReader)
  return {
    files: state.data.data as []
  }
}

const mapDispatchToProps = (dispatch: AppDispatch): FilesDispatchProps => {
  return {
    getFiles: () => dispatch(getFiles())
  }
}

export const ListFiles = connect<FilesProps, FilesDispatchProps, {}, ApplicationState>(
  mapStateToProps,
  mapDispatchToProps
)(filesReader)
