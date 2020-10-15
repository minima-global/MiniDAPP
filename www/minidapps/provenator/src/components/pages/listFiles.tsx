import React, { useState, useRef, useEffect } from 'react'
import { connect } from 'react-redux'

import Markdown from 'react-markdown'
import { SimpleArrayRenderer } from '../simpleRenderer'

//import { getList }  from '../../utils'
import { getFiles } from '../../store/app/blockchain/actions'

import {
    ApplicationState,
    AppDispatch,
    GetProps,
} from '../../store/types'

import { FormHelpers, Files, GeneralError, Remote } from '../../config'

import { themeStyles } from '../../styles'

interface FilesProps {
  files: GetProps
}

interface FilesDispatchProps {
  getFiles: () => void
}

type Props =  FilesProps & FilesDispatchProps

const filesReader = (props: Props) => {

    let isFirstRun = useRef(true)
    let [hashes, setHashes] = useState([] as any[])

    const themeClasses = themeStyles()


    useEffect(() => {

        if ( isFirstRun.current ) {

          isFirstRun.current = false
          props.getFiles()

        } else if (props.files.data) {

            if (props.files.data.length > 0) {

              let fileInfo: any[] = []

              for ( var i = 0; i < props.files.data.length; i++) {

                    const renderHTML = (
                        <React.Fragment key={props.files.data[i].hash}>
                        <p>
                            {Files.hash}: {props.files.data[i].hash}<br/>
                            {Files.block}: {props.files.data[i].block}
                        </p>
                        </React.Fragment>
                    )
                    fileInfo.push(renderHTML)
                }
                setHashes(fileInfo)
            }
        }

    }, [props.files])

    return (
      <div>
        <h2>{Files.heading}</h2>
        <hr />
        <p>
          <SimpleArrayRenderer data={hashes} />
        </p>
      </div>
    )
}

const mapStateToProps = (state: ApplicationState): FilesProps => {
  //console.log(state.orgReader)
  return {
    files: state.data as GetProps
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
