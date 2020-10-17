
import React, { useState, useRef, useEffect } from 'react'
import { connect } from 'react-redux'
import { useParams } from 'react-router-dom'

import Markdown from 'react-markdown'

import SparkMD5 from 'spark-md5'

import * as Yup from 'yup'

import { Formik, Form, Field, FormikProps } from 'formik'
import { FormControl } from '@material-ui/core'
import { TextField } from "material-ui-formik-components"

import Tooltip from '@material-ui/core/Tooltip'

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
    TxData
} from '../../store/types'

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

const getFile = (props: Props) => {

    let isFirstRun = useRef(true)
    const [isLoading, setIsLoading] = useState(false)
    const {fileName, hash} = useParams()
    const [isSubmitting, setSubmit] = useState(false)
    const [info, setInfo] = useState("")

    useEffect(() => {

      if ( isFirstRun.current ) {

        isFirstRun.current = false
        props.initialise()

      } else {

        const txData: TxData = props.info.data as TxData
        const txSummary = txData.summary
        const infoData = getDictEntries(props.info)
        if( txData.id != "" ) {
            setInfo( infoData )
            setSubmit(false)
        }
      }

    }, [props.info])

    return (
      <>
        <h2>{FileConfig.headingAddFile}</h2>
        <hr />
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

export const AddCheckedFile = connect<FileStateProps, FileDispatchProps, {}, ApplicationState>(
  mapStateToProps,
  mapDispatchToProps
)(getFile)
