import { write } from '../../actions'
import { AppDispatch, ChainDataProps, ChainDataActionTypes, TransactionActionTypes, FileProps } from '../../types'

import { Transaction, Scripts } from '../../../config'

// @ts-ignore
import { Minima } from './minima'

export const init = () => {
    return async (dispatch: AppDispatch) => {

      Minima.cmd("extrascript \"" + Scripts.fileContract + "\"; keys new; newaddress", function(respJSON: any) {

          let chainData:  ChainDataProps = {
            data: {
              fileContractAddress: respJSON[0].response.address.hexaddress
            }
          }

          //console.log(chainData)

          dispatch(write({data: chainData.data})(ChainDataActionTypes.ADD_DATA))

      })

       Minima.init()
    }
}

export const addFile = (props: FileProps) => {
  return async (dispatch: AppDispatch, getState: Function) => {

        const state = getState()
        const contract = state.chainInfo.data.fileContractAddress

        const txnId = Math.floor(Math.random()*1000000000)
        let txData = {
            key: 0,
            summary: Transaction.pending,
            time: new Date(Date.now()).toString()
        }

        Minima.cmd("newscript let this=provenator return false;" , function(scriptJSON: any) {

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
