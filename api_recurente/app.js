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
            if (err){console.log("err")
                }
            if (results.length === 0){
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