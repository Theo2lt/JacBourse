/// API ///
const axios = require('axios');

/// MYSQL ///
var mysql = require('mysql');

var bdd = mysql.createConnection({
    host     : 'localhost',
    user     : 'api',
    password : 'Bourse75',
    database : 'bourse' // Changer le nom de la database
});

//// Insert SQL ////
const req_sql = async (req) => {

    bdd.query(req, function(err, result) {
    
        if (err){
            //console.log("----------------------------------------------------------------------")
            //console.log(req) // Affichage requete
            //console.log(err.message) // Affichage erreur de la requete
            //console.log("----------------------------------------------------------------------") 
        }else{
            
        }
    });

}


// ================================================================================================== //
                                        // Fonction Crypto //
// ================================================================================================== //



//// ticker update SQL ////
 const ticker_update_sql = async(req) =>{
   
    bdd.query(req, function(err, result) {
    
        if (err){
            //console.log("----------------------------------------------------------------------")
            //console.log(req) // Affichage requete
            //console.log(err.message) // Affichage erreur de la requete
            //console.log("----------------------------------------------------------------------") 
        }else{
            for (const i of result) {
                
                api_tradingview(i.symbol,"1D")
                api_tradingview(i.symbol,"1")

                
            }
        }
    });

}

// Prends en paramètre différente information pour émetre une requete en GET en retourne des données sous le formet json //
const api_tradingview = (symbol,resolution) => { 
    
    from = Date.now().toString().substring(0,10)-250400,
    to = Date.now().toString().substring(0,10),
    currencyCode = "EUR"
    

    axios.get("https://www.boursedirect.fr/api/tradingview/history" + "?symbol=" + symbol + "&resolution="+ resolution +"&from="+ from +"&to="+ to +"&currencyCode=" + currencyCode).then(response => {

        tradingview_udpate(response.data, symbol,resolution,currencyCode);

        }).catch(error => {

            console.log("erreur API");
            console.log(error )
            
        });   

}

//// fonction qui transforme le format json des valeur boursière en format SQL ////
const tradingview_udpate = async (data,symbol,intervall,devise) => {

    for (let i = 0; i < data.t.length; i++) {
        
        i_open = data.o[i]
        i_high = data.h[i]
        i_low = data.l[i]
        i_close = data.c[i]
        i_volume = data.v[i]

        date = new Date(parseInt(data.t[i]+"000")).toISOString().slice(0, 19).replace('T',' ');

        req_insert = "INSERT INTO action_values VALUES " ;
        req_insert += "( '" + symbol+"/"+devise+"/"+data.t[i]+"/"+intervall+"' ,"+ data.o[i] + " , " + data.h[i] + " , " + data.l[i] + " , " + data.c[i] + " , " + data.v[i] + ", '" + intervall + "' , '" + devise + "' , '" + symbol + "' ,  " + data.t[i]/*timestamp*/ + " ,'" +date + "');";
        
        req_sql(req_insert)
        

        if (data.t[data.t.length-1] ==  data.t[i]) {
            req_update = "update action_values set " ;
            req_update += "open =" + data.o[i] +",high = " + data.h[i] + ",low =" + data.l[i] +",close =" + data.c[i] +",volume =" + data.v[i] +" where id = '"+ symbol+"/"+devise+"/"+data.t[i]+"/"+intervall+"';"
            req_sql(req_update)

        }
        
    }
    
}


// ================================================================================================== //
                                        // Fonction Crypto //
// ================================================================================================== //

//// crypto update SQL ////
const crypto_update_sql = async(req) =>{
   
    bdd.query(req, function(err, result) {
    
        if (err){
            //console.log("----------------------------------------------------------------------")
            //console.log(req) // Affichage requete
            //console.log(err.message) // Affichage erreur de la requete
            //console.log("----------------------------------------------------------------------") 
        }else{
            for (const i of result) {
                
                api_coinmarketcap(i.symbol,"hourly")
                api_coinmarketcap(i.symbol,"daily")
                api_coinmarketcap(i.symbol,"weekly")
                api_coinmarketcap(i.symbol,"monthly")
                api_coinmarketcap(i.symbol,"yearly")

                
            }
        }
    });

}


const api_coinmarketcap = async ( valeur_id , valeur_interval) => { 
    
    from = Date.now().toString().substring(0,10)-1000000
    to = Date.now().toString().substring(0,10)

const params = {
    symbol : valeur_id,
    time_start : from,
    time_end : to,
    convert : "EUR",
    interval : valeur_interval
}



axios.get('https://web-api.coinmarketcap.com/v1/cryptocurrency/ohlcv/historical', {params}).then(response => {

    coinmarketcap_update(response.data,valeur_interval);
    
    }).catch(error => {

        console.log("erreur API");
        console.log(error)

    });   

}


const coinmarketcap_update = async (historical,valeur_interval) => { 

//console.log(DATA.data.quotes); // L'afficher les valueurs des cotations 

for (const valeur of historical.data.quotes) {

    //console.log(Object.keys(valeur.quote)[0]); // Affiche les différentes cotations possibles

    for (var devise of Object.keys(valeur.quote)) { 
        
        var ohlcvmt = valeur.quote[devise] // Recupère la valeur des devises grace a For of
        
        timestamp = new Date(ohlcvmt.timestamp).getTime().toString().slice(0,10)
        date = new Date(parseInt(timestamp+"000")).toISOString().slice(0, 19).replace('T',' ');
    
        req_insert = "INSERT INTO cryptos_values VALUES" ;
        req_insert += "( '" + historical.data.symbol+devise+timestamp+"|"+valeur_interval+"' , '" + historical.data.symbol + "' , '" + devise + "' , '" +valeur_interval+"',"+  ohlcvmt.open + " , " + ohlcvmt.high + " , " + ohlcvmt.low + " , " + ohlcvmt.close + " , " + ohlcvmt.volume + " , " + ohlcvmt.market_cap + " ,  " + timestamp + " , '" + date+ "' );";
        
        req_sql(req_insert)
        
    }
}

}

// ================================================================== //
//                          Mise à jour                               //
// ================================================================== //

function miseEnAttente()
{
 //Traitement
 setTimeout(fonctionAExecuter, 60000); //On attend 60 secondes avant d'exécuter la fonction
}
function fonctionAExecuter()
{
    console.log(new Date(parseInt(Date.now())).toISOString().slice(0, 19).replace('T',' ') + " | Mise à jour.........")
    ticker_update_sql('select * from action_tickers where symbol = "XPAR:PX1";') // Met à jour la liste des données boursière grace au tickers
    crypto_update_sql('select * from cryptos_list where symbol = "BTC";')
    miseEnAttente()
}

fonctionAExecuter()

//=================================================================== //