import { write } from '../../actions'
import { AppDispatch, ChainDataProps, ChainDataActionTypes, TransactionActionTypes, FileProps } from '../../types'

import { Transaction } from '../../../config'

// @ts-ignore
import { Minima } from './minima'

// Test Minima
//Listen for Minima Events
/*window.addEventListener('MinimaEvent', function(evt) {})
Minima.cmd("random", function(json: any) {
    console.log("Minima random: ", json.response.random)
})*/

export const init = () => {
    return async (dispatch: AppDispatch) => {
       Minima.init()
    }
}

export const addAddress = () => {
    return async (dispatch: AppDispatch) => {

        let chainData:  ChainDataProps = {
          data: {
            hexAccount: '',
            account: ''
          }
        }

        Minima.cmd("newaddress" , function( json: any ) {
            //console.log(json)
        	//Double check this.. otherwise may LOSE funds..
        	if( json.status ) {
                //console.log(json, json.response.address.hexaddress, json.response.address.miniaddress)
        		//Get the address
        		chainData.data.hexAccount = json.response.address.hexaddress
                chainData.data.account = json.response.address.miniaddress
            }
        })

        dispatch(write({data: chainData.data})(ChainDataActionTypes.ADD_DATA))
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

        Minima.cmd( "keys new;newaddress;" , function(keysJSON: any){

            if( !Minima.util.checkAllResponses(keysJSON) ) {

                txData.summary = Transaction.failure
                dispatch(write({data: txData})(TransactionActionTypes.TRANSACTION_FAILURE))

            } else {

                const pubKey  = keysJSON[0].response.key.publickey
        		const address = keysJSON[1].response.address.hexaddress
        		const txnId = Math.floor(Math.random()*1000000000)

        		//Script to create transaction..
        		//TXNAUTO automatically scales the values..
        		const addFileScript =
        			"txncreate "+txnId+";"+
        			"txnstate " + txnId + " 0 " + pubKey + ";" +
        			"txnstate " + txnId + " 1 " + address + ";" +
                    "txnstate " + txnId + " 0 "  + props.fileHash + ";" +
                    "txnsign " + txnId + " " + pubKey + ";" +
                    "txnpost " + txnId + ";" +
        			"txndelete " + txnId + ";";

                dispatch(write({data: txData})(TransactionActionTypes.TRANSACTION_PENDING))

        		//And Run it..
        		Minima.cmd( addFileScript , function(respJSON: any) {

                    console.log(respJSON)
                    if( !Minima.util.checkAllResponses(keysJSON) ) {

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
