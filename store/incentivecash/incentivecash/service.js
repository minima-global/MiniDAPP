const USERIDFILE  = "uid.txt";
const TOKENFILE   = "token.txt";
const app         = "INCENTIVECASH"
const blockTooOld = 1000000;
var tokenid       = "";
var uid           = "";
var missedStore   = {};

var logged        = false;
var loggedUID     = false;
var loggedTOKEN   = false;

function fetchTokenID() {

  Minima.file.load(TOKENFILE, function(res) {

    if (res.success) {

      if (!loggedTOKEN) {
        Minima.log(app + " fetched tokenid.");
        loggedTOKEN = true;
      }
      const data = JSON.parse(res.data);
      tokenid = data.tokenId;
    }
  });
}

function getUID() {

  Minima.file.load(USERIDFILE, function(res) {

    if (res.success) {
      
      if(!loggedUID) {
        Minima.log(app + " fetched userid");
        loggedUID = true;
      }

      const data = JSON.parse(res.data);
      uid = data.uid;
    }
  });
}

function postTransaction(coinid, amount, pKey, stash) {

  var txnID = Math.floor(Math.random()*1000000000);
  var devNull = '';
  var postTransaction = '';

  if (stash) {
    devNull = '0xCCEEFFEE';
  } else {
    devNull = '0xEEFFEEFFEE'
  }

  postTransaction =
  "txncreate "+txnID+";"+
  "txninput "+txnID+" "+coinid+";"+
  "txnoutput "+txnID+" "+amount+" "+devNull+" "+tokenid+";"+
  "txnstate "+txnID+" 0 \""+uid+"\";"+
  "txnsign "+txnID+" "+pKey+";"+
  "txnpost "+txnID+";"+
  "txndelete "+txnID;

  Minima.log(app + " posting tx: " + postTransaction);
  Minima.log(app + " txid: " + txnID + ", coinid: " + coinid + ", amount: " + amount);
  Minima.log(app + ' posting on block: ' + Minima.block);
  Minima.log(app + " pkey: " + pKey + ", uid: " + uid);

  Minima.cmd(postTransaction, function(res) {
    if (!res.status) {
      Minima.log(app + " " + JSON.stringify(res));
    }
  });
}


function getCash() {

  var timeaddress = '0x8342FCBC1B674B65AD3E1D73B7FB89BD48C9FC96';
  Minima.cmd('coins relevant address:'+timeaddress+' tokenid:'+tokenid, function(res) {

    if (res.status) {

      res.response.coins.forEach(function(coin, i) {

        if ( coin.data.prevstate[0] && coin.data.prevstate[1] && coin.data.prevstate[2] ) {
          
          if ( coin.data.prevstate[1].data <= Minima.block && coin.data.prevstate[2].data >= Minima.block )  {
            
            Minima.log(app + ' minBlock: ' + coin.data.prevstate[1].data + ' , maxBlock: ' + coin.data.prevstate[2].data);
            postTransaction(coin.data.coin.coinid, coin.data.coin.amount, coin.data.prevstate[0].data, false);
            
          } else if ( coin.data.prevstate[2].data < Minima.block ) {
            
            var maxBlockFiveHundred = parseInt(coin.data.prevstate[2].data) + 500;

            if ( Minima.block >= maxBlockFiveHundred ) {

              Minima.log(app + ' stashing missed collection with coinid: ' + coin.data.coin.coinid + ', current block: ' + Minima.block + ' maxblock and five hundred: ' + maxBlockFiveHundred);
              postTransaction(coin.data.coin.coinid, coin.data.coin.amount, coin.data.prevstate[0].data, true);

            }

            const storedMissed = missedStore[coin.data.coin.coinid];
            if ( !storedMissed ) {

              const missedDetails = {
                maxBlock: coin.data.prevstate[2].data
              };
              missedStore[coin.data.coin.coinid] = missedDetails;
              Minima.log(app + ' missed collection - coinid: ' + coin.data.coin.coinid + ', maxBlock: ' + missedDetails.maxBlock + ', current block: ' + Minima.block);
            }
          }
        } 
      });
    }
  });
}

function pollCash(block) {
  if (block % 20 == false) {
    getCash();
  }
}

function getIDs() {

  getUID();
  fetchTokenID();

}

Minima.init(function(msg) {

  if (msg.event == 'connected') {

    Minima.log(app + ' service.js initialising');
    getIDs()

  } else if (msg.event == 'newblock') {

    if ( tokenid === "" || uid === "" ) {

      if (!logged) {
        Minima.log(app + ': user has not logged in, please log in.');
        logged = true;
      }
      getIDs()

    } else {

      if (logged) {
        Minima.log(app + ': user logged in.');
        logged = false;
      }

      const now = Date.now();
      const blockTime = msg.info.txpow.header.timemilli;
      //Minima.log(app + ' now: ' + now + ' blockTime: ' + blockTime);
      if ( now - blockTime < blockTooOld ) {

        pollCash(msg.info.txpow.header.block);

      } else {

        Minima.log(app + ' blockTime too old! blockTime: ' + blockTime + ' now: ' + now);
      }

    }
  }
});
