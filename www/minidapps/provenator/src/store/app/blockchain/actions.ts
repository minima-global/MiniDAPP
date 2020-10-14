import { write } from '../../actions'
import { AppDispatch, ChainDataProps, ChainDataActionTypes, TransactionActionTypes, FileProps } from '../../types'

import { Transaction, Scripts } from '../../../config'

import { getKeyedList } from '../../../utils'

// @ts-ignore
import { Minima } from './minima'

export const init = () => {
    return async (dispatch: AppDispatch) => {

      Minima.init()
    }
}

export const status = () => {
  return async (dispatch: AppDispatch) => {

    Minima.cmd("status", function(respJSON: any) {

        console.log(respJSON)

        let status: string = ''
        for (const [key, value] of Object.entries(respJSON.response)) {
          status += `**${key}**: ${value}<br/>`
        }

        let chainData:  ChainDataProps = {
          data: {
            status: status
          }
        }

        dispatch(write({data: chainData.data})(ChainDataActionTypes.ADD_DATA))

    })
  }
}

export const addFile = (props: FileProps) => {
  return async (dispatch: AppDispatch) => {

        const txnId = Math.floor(Math.random()*1000000000)
        let txData = {
            key: 0,
            summary: Transaction.pending,
            time: new Date(Date.now()).toString()
        }

        Minima.cmd(`newscript ${Scripts.fileContract};`, function(scriptJSON: any) {

            if( !Minima.util.checkAllResponses(scriptJSON) ) {

                txData.summary = Transaction.failure
                dispatch(write({data: txData})(TransactionActionTypes.TRANSACTION_FAILURE))

            } else {

              const txAmount = 0.01
              const scriptAddress = scriptJSON[0].response.address.hexaddress;
          		const txnId = Math.floor(Math.random()*1000000000)

          		const addFileScript =
          			"txncreate "+ txnId + ";" +
          			"txnstate " + txnId + " 0 " + props.fileHash + ";" +
                "txnauto " + txnId + " " + txAmount + " " + scriptAddress + ";" +
                "txnpost " + txnId + ";" +
          			"txndelete " + txnId + ";";

                dispatch(write({data: txData})(TransactionActionTypes.TRANSACTION_PENDING))

            		Minima.cmd( addFileScript , function(respJSON: any) {

                      console.log(respJSON)

                      txData.key = scriptAddress
                      if( !Minima.util.checkAllResponses(respJSON) ) {

                          txData.summary = Transaction.failure
                          dispatch(write({data: txData})(TransactionActionTypes.TRANSACTION_FAILURE))

                      } else {

                          txData.summary = Transaction.success
                          dispatch(write({data: txData})(TransactionActionTypes.TRANSACTION_SUCCESS))
      				        }
          		  })
            }
    	})
  }
}

export const getFiles = () => {
  return async (dispatch: AppDispatch) => {

      console.log("getting files")

      let txData = {
          key: 0,
          summary: Transaction.pending,
          time: new Date(Date.now()).toString()
      }

        Minima.cmd("coins;" , function(respJSON: any) {

            if( !Minima.util.checkAllResponses(respJSON) ) {

                txData.summary = Transaction.failure
                dispatch(write({data: txData})(TransactionActionTypes.TRANSACTION_FAILURE))

            } else {

              console.log(respJSON)
            }
    	})
  }
}
