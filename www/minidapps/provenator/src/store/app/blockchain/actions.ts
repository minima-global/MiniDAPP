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
        const time = new Date(Date.now()).toString()

        Minima.cmd("keys", function( json: any ) {

            if( json.status ) {

                //console.log(json)
                const key = json.response.publickeys[0].publickey
                //console.log(key)

                let txData = {
                    key: key,
                    summary: Transaction.pending,
                    time: time
                }
                dispatch(write({data: txData})(TransactionActionTypes.TRANSACTION_PENDING))

                const addFileScript = "txncreate " +txnId+ ";" +
                                      "txnstate " + txnId + " 0 "  + props.fileHash + ";" +
                                      "txnstate " + txnId +" 1 " + time + ";" +
                                      "txnsign " + txnId + " " + key + ";" +
                                      "txnpost " + txnId + ";" +
                                      "txndelete " + txnId + ";"

                Minima.cmd( addFileScript , function( resp: any ) {

                    console.log(resp)
                    let len = resp.length;
    				for( var i=0; i < resp.length; i++) {

                        if(resp[i].status != true) {

    						console.log(resp[i].message)
                            txData.summary = Transaction.failure
                            dispatch(write({data: txData})(TransactionActionTypes.TRANSACTION_FAILURE))

    					} else {

                            txData.summary = Transaction.success
                            dispatch(write({data: txData})(TransactionActionTypes.TRANSACTION_SUCCESS))
                        }
    				}
        		})
            }
        })
  }
}
