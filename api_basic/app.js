/// API ///
const axios = require('axios');

/// MODULE SERVEUR ///
const express = require('express') 
const app = express() 

/// MODULE INFORMATION CONNECTION ///
const morgan = require('morgan') 

/// MYSQL ///
var mysql = require('mysql'); // module Mysql

var bdd = mysql.createConnection({
    host     : 'localhost',
    user     : 'api',
    password : 'Bourse75',
    database : 'bourse' // Changer le nom de la database
});

/// LOGER ///

const log_sql = (req,res) =>{      
    
    //console.log(req._startTime.toISOString().slice(0, 19).replace('T', ' '))
    //console.log(req._remoteAddress)
    //console.log(req.method)  
    //console.log(req.url)
    //console.log(res.statusCode)
    //console.log(req.headers['user-agent'])

    req_insert = "INSERT INTO logs VALUES" ;
    req_insert += "('"+ req._startTime.toISOString().slice(0, 19).replace('T', ' ')+"','"+req._remoteAddress+"','"+req.method+"','"+req.url+ "','"+res.statusCode+"','"+req.headers['user-agent']+"');";
    //console.log(req_insert)
    
    req_sql(req_insert)
    
}
// ================================================================================================== //
                                        //  MIDDLEWARE //
// ================================================================================================== //

app.use(morgan('combined' , {skip : log_sql }))

        // ==================================================================================== //
                                       //  MIDDLEWARE ACTION //
        // ==================================================================================== //

app.get('/api/v1/action_tickers' , (req,res) => {
        
        if (req.query.name == undefined  && req.query.symbol == undefined && req.query.mic == undefined && req.query.ticker == undefined) {
            
            req_sql = 'select * from action_tickers;'
            
            bdd.query(req_sql, function (err ,result){
                if (err) throw err;
                res.json(success(result))
            })
            
        }else if(req.query.name != undefined  || req.query.symbol != undefined || req.query.mic != undefined || req.query.ticker != undefined){
            
            var req_sql = "SELECT * FROM action_tickers WHERE"
            
            if(req.query.name != undefined ){ 
                req_sql += ` name = "${req.query.name}"   && `}
            else{ 
                req_sql += ` name  IS NOT NULL && `}

            if(req.query.symbol != undefined){ 
                req_sql += ` symbol = "${req.query.symbol}"  && `}
            else{ 
                req_sql += ` symbol IS NOT NULL && `}

            if(req.query.mic != undefined){
                req_sql += ` mic = "${req.query.mic}"  && `} 
            else{ 
                req_sql += ` mic IS NOT NULL && `}

            if(req.query.ticker != undefined){
                req_sql += ` ticker = "${req.query.ticker}";`}
            else{
                req_sql += ` ticker IS NOT NULL ;`}

                //console.log(req_sql)

            bdd.query(mysql.format(req_sql), function (err, results, fields) {
                if (err){
                    console.log("err")   
                   }
                if(results.length === 0){
                    res.json(error("Erreur : paramètre "))
                }else{
                    res.json(success(results))
                }
                
              });   
        }
})

app.get('/api/v1/action_values' , (req,res) =>{

    if (req.query.symbol == undefined || req.query.symbol == "" ){
        res.json(error("symbol non définie "))
    }else{

        var req_sql = "SELECT open,high,low,close,volume,resolution,devise,symbol,timestamp,date FROM action_values WHERE"
        
        req_sql += ` symbol = "${req.query.symbol}"   && `

        if(req.query.resolution != undefined ){ 
            req_sql += ` resolution = "${req.query.resolution}"  && `}
        else{
            res.json(error(" resolution : n'est pas correctement défini "))
            //console.log("erreur")
            return
        }

        if(req.query.from != undefined && req.query.from.length <= 10){ 
            
            req_sql += ` timestamp > "${req.query.from}"  && `

        }else{
            res.json(error(" from : doit être un horodatage ISO 8601 ou une valeur d'heure Unix valide d'une longueur de 10 éléments. Exemple: 0123456789 ou 1632546987"))
            //console.log("erreur")
            return
        }
        
        if(req.query.to != undefined && req.query.to.length <= 10){ 
            req_sql += ` timestamp < "${req.query.to}" `}
            
        else{ 
            res.json(error(" from : doit être un horodatage ISO 8601 ou une valeur d'heure Unix valide d'une longueur de 10 éléments. Exemple: 0123456789 ou 1632546987"))
            //console.log("erreur")
            return
        }

        if (parseInt(req.query.from) >= parseInt(req.query.to)) {
            
            res.json(error("Erreur : From > To "))
            return
        }
       
        // Trier par grandeur TimeStamp
        req_sql += "ORDER BY timestamp;" 
        
        api_tradingview(req.query.symbol,req.query.resolution)

        //console.log(req_sql)
        bdd.query(req_sql, function (err ,result){
            if (err){
            console.log("err")   
            }
        res.json(success(result))
        })
    }

})

app.get('/api/v1/action_composants' , (req ,res) => {    
    if ( req.query.symbol == undefined  &&  req.query.name_market == undefined  &&  req.query.id_isin == undefined ) {
        
        req_sql = 'select name , name_market , id_isin , symbol , mic ,ticker  from action_composants INNER JOIN  action_tickers ON action_composants.id_isin = action_tickers.isin;'

        bdd.query(req_sql, function (err ,result){
            if (err) throw err;
            res.json(success(result))
        })
    }else if (req.query.symbol != undefined  ||  req.query.name_market != undefined  ||  req.query.id_isin != undefined){
        
        var req_sql = "select name , name_market , id_isin , symbol , mic ,ticker  from action_composants INNER JOIN  action_tickers ON action_composants.id_isin = action_tickers.isin where"
            
        if(req.query.symbol != undefined ){ 
            req_sql += ` symbol = "${req.query.symbol}"   && `}
        else{ 
            req_sql += ` symbol  IS NOT NULL && `}

        if(req.query.name_market != undefined ){ 
            req_sql += ` name_market = "${req.query.name_market}"   && `}
        else{ 
            req_sql += ` name_market  IS NOT NULL && `}

        if(req.query.id_isin != undefined ){ 
            req_sql += ` id_isin = "${req.query.id_isin}" ;`}
        else{ 
            req_sql += ` id_isin  IS NOT NULL  ;`}

        //console.log(req_sql)
        bdd.query(mysql.format(req_sql), function (err, results, fields) {
            if (err){console.log("err")}
            if (results.length === 0){
                res.json(error("Erreur : paramètre "))
            } else{
                res.json(success(results))
            }
            
          });
    }
})

        // ==================================================================================== //
                                       //  MIDDLEWARE CRYPTOS //
        // ==================================================================================== //
        
app.get('/api/v1/cryptos_list' , (req,res) => {
        
            if (req.query.id == undefined  && req.query.name_id == undefined && req.query.symbol_id == undefined && req.query.rank_id == undefined) {
                
                req_sql = 'select * from cryptos_list;'
                
                bdd.query(req_sql, function (err ,result){
                    if (err) throw err;
                    res.json(success(result))
                })
                
            }else if(req.query.id != undefined  || req.query.name_id != undefined || req.query.symbol_id != undefined || req.query.rank_id != undefined){
                
                var req_sql = "SELECT * FROM cryptos_list WHERE"
                
                if(req.query.id != undefined ){ 
                    req_sql += ` id = "${req.query.id}"   && `}
                else{ 
                    req_sql += ` id  IS NOT NULL && `}
    
                if(req.query.name_id != undefined){ 
                    req_sql += ` name = "${req.query.name_id}"  && `}
                else{ 
                    req_sql += ` name IS NOT NULL && `}
    
                if(req.query.symbol_id != undefined){
                    req_sql += ` symbol = "${req.query.symbol_id}"  && `} 
                else{ 
                    req_sql += ` symbol IS NOT NULL && `}
    
                if(req.query.rank_id != undefined){
                    req_sql += ` rang = "${req.query.rank_id}";`}
                else{
                    req_sql += ` rang IS NOT NULL ;`}
    
                    //console.log(req_sql)
    
                bdd.query(mysql.format(req_sql), function (err, results, fields) {
                    if (err){
                        console.log("err")   
                       }
                    if(results.length === 0){
                        res.json(error("Erreur : paramètre "))
                    }else{
                        res.json(success(results))
                    }
                    
                  });   
            }
})
    
app.get('/api/v1/cryptos_values' , (req,res) =>{
    
        if (req.query.symbol == undefined || req.query.symbol == "" ){
            res.json(error("symbol non définie "))
        }else{
    
            var req_sql = "SELECT open,high,low,close,volume,market_cap,resolution,devise,symbol,timestamp,date FROM cryptos_values WHERE"
            
            req_sql += ` symbol = "${req.query.symbol}"   && `
    
            if(req.query.resolution == "1H" || "1D" || "1W" || "1M" || "1Y" ){ 
                req_sql += ` resolution = "${req.query.resolution}"  && `}
            else{
                res.json(error(" resolution : n'est pas correctement défini. '1h' une heur, "))
                //console.log("erreur")
                return
            }
    
            if(req.query.from != undefined && req.query.from.length >= 10){ 
                
                req_sql += ` timestamp > "${req.query.from}"  && `
    

            }else{ 
                res.json(error(" from : doit être un horodatage ISO 8601 ou une valeur d'heure Unix valide d'une longueur de 10 éléments. Exemple: 0123456789 ou 1632546987"))
                //console.log("erreur")
                return
            }                
            
            
            if(req.query.to != undefined && req.query.to.length >= 10){ 
                req_sql += ` timestamp < "${req.query.to}" `}
                
            else{ 
                res.json(error(" from : doit être un horodatage ISO 8601 ou une valeur d'heure Unix valide d'une longueur de 10 éléments. Exemple: 0123456789 ou 1632546987"))
                //console.log("erreur")
                return
            }
            
            if (parseInt(req.query.from) >= parseInt(req.query.to)) {
            
                res.json(error("Erreur : From > To "))
                return
            }

            // Trier par grandeur TimeStamp
            req_sql += "ORDER BY timestamp;" 

            api_coinmarketcap(req.query.symbol,req.query.resolution,req.query.from,req.query.to)   

            //console.log(req_sql)
            bdd.query(req_sql, function (err ,result){
                if (err){
                console.log("err")   
                }
            res.json(success(result))
            })
        }
    
})
    
        // ==================================================================================== //
                                      //  MIDDLEWARE PORT D'ECOUTE //
        // ==================================================================================== //
        
app.listen(port = 8080, () => console.log("[nodemon] starting port : " + port))



const success = (result) => {
    return{
        status : 'success',
        return : result
    }
}

const error = (message) => {
    return{
        status : 'error',
        return : message
    }
}

// ================================================================================================== //
                                        // Fonction ACTION //
// ================================================================================================== //

// Prends en paramètre différente information pour émetre une requete en GET en retourne des données sous le formet json //
const api_tradingview = async(symbol,resolution) => { 
    
    from = 100,
    to = Date.now().toString().substring(0,10),
    currencyCode = "EUR"
    

    axios.get("https://www.boursedirect.fr/api/tradingview/history" + "?symbol=" + symbol + "&resolution="+ resolution +"&from="+ from +"&to="+ to +"&currencyCode=" + currencyCode).then(response => {

        tradingview_udpate(response.data, symbol,resolution,currencyCode)

        }).catch(error => {

            //console.log("erreur API");
            //console.log(error)
            
        })   
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
        
        req_insert_update_action(req_insert)
        

        if (data.t[data.t.length-1] ==  data.t[i]) {
            req_update = "update action_values set " ;
            req_update += "open =" + data.o[i] +",high = " + data.h[i] + ",low =" + data.l[i] +",close =" + data.c[i] +",volume =" + data.v[i] +" where id = '"+ symbol+"/"+devise+"/"+data.t[i]+"/"+intervall+"';"
            req_sql(req_update)

        }
        
    }
    
}

//// Function insert & udpate Action ///
const req_insert_update_action = async (req) =>{

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


const api_coinmarketcap = async ( valeur_id , valeur_interval_réel ,from ,to ) => { 
    
        switch (valeur_interval_réel) {
            case "1H":
                valeur_interval_source = "hourly"
                break;

            case "1D":
                valeur_interval_source = "daily"
                break;

            case "1W":
                valeur_interval_source = "weekly"
                break;
            
            case "1M":
                valeur_interval_source = "monthly"
                break;

            case "1Y":
                valeur_interval_source = "yearly"
                break;

            default:
                break;
        }

    const params = {
        symbol : valeur_id,
        time_start : from,
        time_end : to,
        convert : "EUR",
        interval : valeur_interval_source
    }
    
    
    console.log(params);
    axios.get('https://web-api.coinmarketcap.com/v1/cryptocurrency/ohlcv/historical', {params}).then(response => {

        coinmarketcap_update(response.data,valeur_interval_réel);
        
        }).catch(error => {

            console.log("erreur API");
            

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


// ================================================================================================== //
                                        // Fonction SQL //
// ================================================================================================== //
const req_sql = async (req) =>{

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