import { write } from '../../actions'
import {
  AppDispatch,
  ChainDataProps,
  ChainDataActionTypes,
  TransactionActionTypes,
  GetActionTypes,
  FileProps,
  GetProps,
  Coin
} from '../../types'

import { Transaction, Scripts } from '../../../config'

// @ts-ignore
import { Minima } from './minima'

export const init = () => {
    return async (dispatch: AppDispatch, getState: Function) => {

      const state = getState()
      const status = state.chainInfo.data.status

      Minima.cmd(`newscript ${Scripts.fileContract};`, function(scriptJSON: any) {

          if( Minima.util.checkAllResponses(scriptJSON) ) {

            let chainData:  ChainDataProps = {
              data: {
                scriptAddress: scriptJSON[0].response.address.hexaddress,
                status: status
              }
            }
            dispatch(write({data: chainData.data})(ChainDataActionTypes.ADD_DATA))
          }
      })

      Minima.init()
  }
}

export const status = () => {
  return async (dispatch: AppDispatch, getState: Function) => {

    const state = getState()
    const scriptAddress = state.chainInfo.data.scriptAddress

    Minima.cmd("status", function(respJSON: any) {

        //console.log(respJSON)

        let status: string = ''
        for (const [key, value] of Object.entries(respJSON.response)) {
          status += `**${key}**: ${value}<br/>`
        }

        let chainData:  ChainDataProps = {
          data: {
            scriptAddress: scriptAddress,
            status: status
          }
        }

        dispatch(write({data: chainData.data})(ChainDataActionTypes.ADD_DATA))
    })
  }
}

export const addFile = (props: FileProps) => {
  return async (dispatch: AppDispatch, getState: Function) => {

      const state = getState()
      const scriptAddress = state.chainInfo.data.scriptAddress
      const txAmount = 0.01
  		const txnId = Math.floor(Math.random()*1000000000)

      let txData = {
          key: 0,
          summary: Transaction.pending,
          time: new Date(Date.now()).toString()
      }

  		const addFileScript =
  			"txncreate "+ txnId + ";" +
  			"txnstate " + txnId + " 0 " + props.fileHash + ";" +
        "txnauto " + txnId + " " + txAmount + " " + scriptAddress + ";" +
        "txnpost " + txnId + ";" +
  			"txndelete " + txnId + ";";

  		Minima.cmd( addFileScript , function(respJSON: any) {

          //console.log(respJSON)

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
}

export const getFiles = () => {
  return async (dispatch: AppDispatch, getState: Function) => {

      const state = getState()
      const scriptAddress = state.chainInfo.data.scriptAddress

      var fileData: Coin[] = []

      Minima.cmd("coins;", function(respJSON: any) {

        if( Minima.util.checkAllResponses(respJSON) ) {

          //console.log(respJSON)
          const coins = respJSON[0].response.coins
          for ( let i = 0; i < coins.length; i++ ) {
            if (coins[i].data.coin.address == scriptAddress) {
              const coin: Coin = {
                hash: coins[i].data.prevstate[0].data,
                block: coins[i].data.inblock
              }
              fileData.push(coin)
            }
          }
        }

        dispatch(write({data: fileData})(GetActionTypes.GET_SUCCESS))
    	})
  }
}
