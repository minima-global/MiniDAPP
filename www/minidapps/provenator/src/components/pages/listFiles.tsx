import React, { useRef, useState, useEffect } from 'react'
import { connect } from 'react-redux'

import Spinner from 'react-spinner-material'
import { SimpleArrayRenderer } from '../simpleRenderer'

import { getFiles } from '../../store/app/blockchain/actions'

import {
    ApplicationState,
    AppDispatch
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

    const [isLoading, setLoading] = useState(true)
    let isFirstRun = useRef(true)
    let [filesInfo, setFilesInfo] = useState([] as any[])

    const themeClasses = themeStyles()

    useEffect(() => {

        if ( isFirstRun.current ) {

            isFirstRun.current = false
            props.getFiles()

        } else {

            setFilesInfo(props.files)
            setLoading(false)
        }

    }, [props.files])

    return (
      <div>
        <h2>{Files.heading}</h2>
        <hr />
        <div>
            {isLoading ? <div className={themeClasses.spinner}><Spinner radius={40} color={"#38348B"} stroke={5} visible={isLoading} /></div> : <SimpleArrayRenderer data={filesInfo} /> }
        </div>
      </div>
    )
}

const mapStateToProps = (state: ApplicationState): FilesProps => {
  //console.log(state.orgReader)
  return {
    files: state.data
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
