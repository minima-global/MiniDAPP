  const app = 'Block';
  const cryptocurrency = 'Minima';
  var loop = false;
  // SQL to create the dB
  var INITSQL =
  "CREATE Table IF NOT EXISTS txpowlist ("+
  "txpow VARCHAR(16000) NOT NULL," + 
  "height BIGINT NOT NULL," +
  "hash VARCHAR(160) NOT NULL," +
  "isblock int NOT NULL," +
  "relayed BIGINT NOT NULL," +
  "txns int NOT NULL" +
  ")";
  var INDEX = "CREATE INDEX IDXHASH ON txpowlist(hash)";
  var INDEXHEIGHT = "CREATE INDEX IDXHEIGHT ON txpowlist(height DESC)";
  /** Create SQL Table */
  function createSQL(){
    Minima.file.load('createSql.txt', function (res) {
      if (!res.success) {
        Minima.sql(INITSQL+";"+INDEX+";"+INDEXHEIGHT, function(resp){
          Minima.log(JSON.stringify(resp));
          if(!resp.status){
            Minima.log(app + ': ERROR in SQL call!');
          }  else {
            Minima.file.save('', 'createSql.txt', function (res) {});
          }
        });
      }
    });
  }

  var ADDBLOCKQUERY = "INSERT INTO txpowlist VALUES (\""
  function addTxPoW(txpow) {
    
    var isblock = 0;
    if (txpow.isblock) {
      isblock = 1;
    }

    if (!txpow.body) {
      Minima.log('txpow body not found!');
      return;
    }

    // wipe out mmrproofs and signatures for lighter txpows.. 
    txpow.body.witness.signatures = {};
    txpow.body.witness.mmrproofs = {};


       
    Minima.sql(ADDBLOCKQUERY +
      encodeURIComponent(JSON.stringify(txpow)) + /** TXPOW */
      "\"," +
      parseInt(txpow.header.block) + /** HEIGHT */
      ", \"" +
      txpow.txpowid + /** HASH */
      "\", " +
      isblock + /** isblock */
      "," +
      txpow.header.timemilli /** relayed */
      + ","
      + txpow.body.txnlist.length + /** txns */
      ")", function(res) {
      if (res.status) {
        // Minima.log(app + ': timemilli'+txpow.header.timemilli);
        // Minima.log("TxPoW Added To SQL Table.. ");
      }
    });
  }
  
  function pruneData(height) {
    Minima.file.load("prune.txt", function(res){
      if(res.success) {
        var json = JSON.parse(res.data);
        if(json.status) {
          var setPruning = json.period;
          if(height % 1000 == 0) {
            height = height - setPruning;
            Minima.sql("DELETE FROM txpowlist WHERE height <="+height, function(){}); 
          }
        }
        
      } 
    });    
  }

  Minima.init(function(msg){
      if(msg.event == 'connected') {
        // create json to save in file for pruning
        const prune = 
        {
            "status": true,
            "period": 388800
        };
        Minima.file.save(JSON.stringify(prune), "prune.txt", function(res){
          if(!res.success) {
            Minima.log("File saving rejected!");
          }            
        });

        // init SQL DB for blocks
        createSQL();
    
      } else if(msg.event == 'newtxpow') {

        addTxPoW(msg.info.txpow);

        pruneData(msg.info.txpow.header.block);
        
      }
  });
 


