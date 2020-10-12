import React, { useRef, useState, useEffect } from 'react'
import { connect } from 'react-redux'

import Markdown from 'react-markdown'

import SparkMD5 from 'spark-md5'

import * as Yup from 'yup'

import { Formik, Form, Field, FormikProps } from 'formik'
import { FormControl } from '@material-ui/core'
import { TextField } from "material-ui-formik-components"

import Tooltip from '@material-ui/core/Tooltip'
import FileReaderInput from 'react-file-reader-input'

import Grid from '@material-ui/core/Grid'
import RightCircleOutlined from '@ant-design/icons/lib/icons/RightCircleOutlined'
import { Okay, OptionsStyles } from '../../styles'

import { addFile } from '../../store/app/blockchain'
import { initialise as txInitialise } from '../../store/app/tx/actions'

import { history, getDictEntries } from '../../utils'

import { FormHelpers, GeneralError, Transaction, Local, Misc, File as FileConfig } from '../../config'

import {
    ApplicationState,
    AppDispatch,
    FileProps,
    PayloadProps,
    TxData } from '../../store/types'

//import { TxHelper } from '../../components/tx/txHelper'

const addFileSchema = Yup.object().shape({
  fileHash: Yup.string()
    .required(`${GeneralError.required}`)
})


interface FileStateProps {
  info: PayloadProps
}

interface FileDispatchProps {
  initialise: () => void
  handleSubmit: (values: FileProps) => void
}

type Props =  FileDispatchProps & FileStateProps

export const getFile = (props: Props) => {

    let isFirstRun = useRef(true)
    const [isLoading, setIsLoading] = useState(false)
    const [fileName, setFileName] = useState("")
    const [hash, setHash] = useState("")
    const [isSubmitting, setSubmit] = useState(false)
    const [info, setInfo] = useState("")

    useEffect(() => {

        // Stop "Key, summary, time" (info) rendering on first run
        if ( isFirstRun.current ) {

            isFirstRun.current = false

        } else {

            const txData: TxData = props.info.data as TxData
            const txSummary = txData.summary
            //console.log("here! ",  info.summary, txSummary, isSubmitting )
            const infoData = getDictEntries(props.info)
            setInfo( infoData )
            if( txSummary == Transaction.success || txSummary == Transaction.failure ) {
                setSubmit(false)
            }
        }

    }, [props.info])

    const getFile = (e: any, results: any) => {

        const [load, file] = results[0]
        setFileName(file.name)

        const blobSlice = File.prototype.slice
        const chunkSize = Misc.chunkSize                             // Read in chunks of 2MB
        const chunks = Math.ceil(file.size / chunkSize)
        let currentChunk = 0
        let spark = new SparkMD5.ArrayBuffer()
        const fileReader = new FileReader()

        fileReader.onload = function (e) {
            //console.log('read chunk nr', currentChunk + 1, 'of', chunks);
            spark.append(e.target!.result as ArrayBuffer)                   // Append array buffer
            currentChunk++

            if (currentChunk < chunks) {
                loadNext()
            } else {
                // Compute hash
                setHash(spark.end())
                setIsLoading(false)
            }
        }

        fileReader.onerror = () => {
            setIsLoading(false)
            console.warn(`${FileConfig.loadingError}`)
        }

        const loadNext = () => {

            const start = currentChunk * chunkSize
            const end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize
            fileReader.readAsArrayBuffer(blobSlice.call(file, start, end))
        }

        loadNext()
      //})
    }

    const setLoading = () => {
        setFileName("")
        setHash("")
        setIsLoading(!isLoading)
    }

    return (
      <>
        <h2>{FileConfig.headingFile}</h2>
        <hr />
        <FileReaderInput
          as="binary"
          id="fileInput"
          onChange={getFile}
        >
            <Tooltip title={FileConfig.fileTip}>
                <Okay onClick={setLoading} type='submit' variant="contained" color="primary" disabled={isLoading} endIcon={<RightCircleOutlined spin={isLoading}/>}>
                  {FileConfig.getFile}
                </Okay>
            </Tooltip>
        </FileReaderInput>
        <p>
            {FileConfig.fileName}: {fileName}
        </p>
        <Formik
          initialValues={ {fileHash: hash} }
          enableReinitialize={true}
          validationSchema={addFileSchema}
          onSubmit={(values: any) => {

            setSubmit(true)
            props.initialise()

            const fileInfo: FileProps = {
                fileHash: hash,
            }
            props.handleSubmit(fileInfo)
          }}
        >
          {(formProps: FormikProps<any>) => (
            <Form>
              <FormControl fullWidth={true}>
                  <Field
                    name='fileHash'
                    label={FileConfig.hash}
                    component={TextField}
                  />
                  <Grid container>
                      <Grid item xs={12} sm={3}>
                        <Tooltip title={FileConfig.submitTip}>
                          <Okay type='submit' variant="contained" color="primary" disabled={isSubmitting} endIcon={<RightCircleOutlined spin={isSubmitting}/>}>
                            {FileConfig.addFileButton}
                          </Okay>
                        </Tooltip>
                      </Grid>
                      <Grid item xs={12} sm={9}>
                          &nbsp;
                      </Grid>
                  </Grid>
              </FormControl>
            </Form>
        )}
        </Formik>
        <hr />
        <Markdown escapeHtml={false} source={info} />
      </>
    )
}


const mapStateToProps = (state: ApplicationState): FileStateProps => {
  //console.log(state.orgReader)
  return {
    info: state.tx as PayloadProps,
  }
}

const mapDispatchToProps = (dispatch: AppDispatch): FileDispatchProps => {
  return {
    initialise: () => dispatch(txInitialise()),
    handleSubmit: (values: FileProps) => dispatch(addFile(values))
  }
}

export const AddFile = connect<FileStateProps, FileDispatchProps, {}, ApplicationState>(
  mapStateToProps,
  mapDispatchToProps
)(getFile)
