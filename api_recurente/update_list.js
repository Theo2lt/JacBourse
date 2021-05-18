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
// FICHIER //
const fs = require('fs');

//// Fonction insertion SQL ////
const req_sql = async (req) =>{

    bdd.query(req, function(err, result) {
    
        if (err){
            console.log("----------------------------------------------------------------------")
            console.log(req) // Affichage requete
            console.log(err.message) // Affichage erreur de la requete
            console.log("----------------------------------------------------------------------") 
        }else{
            
        }
    });

    
}

// ================================================================== //
                           // Bourse direct //
// ================================================================== //

/// fonction qui transforme le format json des tickers en format SQL ///
const list_action_insert = async (data) => {

        for (const iterator of data.instruments) {
            
            req_insert = "INSERT INTO action_tickers VALUES" ;
                                /*  Nom action  */         /*          Symbole = mic + ticker           */          /* Code  Market */          /* Code Ticker*/    /* identifiant international des valeurs mobilières */
            req_insert += '( "' + iterator.name +'" , "' + iterator.market.mic + ":" + iterator.ticker + '" , "' + iterator.market.mic + '","'+ iterator.ticker + '" , "' + iterator.isin + '" );'

            req_insert_composant = "INSERT INTO action_composants VALUES ('"+ iterator.market.mic + ":" + iterator.ticker +"_"+data.name +"','" + data.name +"','"+iterator.isin+"','"+ iterator.market.mic + ":" + iterator.ticker +"');" 
            req_sql(req_insert)
            req_sql(req_insert_composant)
            
        }
    }


/// Fonction qui retourne la liste des différents ticker en format json ///
const api_list_action = () => {     
    list_action = [
        "https://www.boursedirect.fr/api/instrument/list/europe.components.bel-20-BE0389555039-BEL20-EUR-XBRU",
        "https://www.boursedirect.fr/api/instrument/list/europe.france.components.cac-40-FR0003500008-PX1-EUR-XPAR",
        "https://www.boursedirect.fr/api/instrument/list/europe.france.components.cac-all-tradable-FR0003999499-CACT-EUR-XPAR",
        "https://www.boursedirect.fr/api/instrument/list/usa.components.nasdaq-100-NDX-USD-XNAS",
        "https://www.boursedirect.fr/api/instrument/list/europe.components.aex-index-NL0000000107-AEX-EUR-XAMS"
    ]

    for (const list of list_action) {

        axios.get(list).then(response => {
            
            list_action_insert(response.data);

        }).catch(error => {

            console.log("erreur API");
            console.log(error)
            
        });  
    }

    fs.readFile('list_indice.json', (err, data) => {
        if (err) throw err;

        for (const iterator of JSON.parse(data)) {
    
            req_insert = "INSERT INTO action_tickers VALUES" ;
                            /*  Nom action  */  /* Symbole = mic:ticker   *//* Code  Market */   /* Code Ticker*/    /* identifiant international des valeurs mobilières */
            req_insert += '( "' + iterator.name +'" , "' + iterator.symbol + '" , "' + iterator.mic + '","'+ iterator.ticker + '" , "' + iterator.isin + '" );'
            
            req_sql(req_insert)
            
        }
    
    });

}

// ================================================================== //
                            // Cryptomonais //
// ================================================================== //


const update_map  = async (map) =>{
    
    for (const valeur of map.data) {

        req_insert = "INSERT INTO cryptos_list VALUES" ;
        req_insert += "("+ valeur.id +", \"" + valeur.name + "\" , '" + valeur.symbol + "' , " + valeur.rank + " , " + valeur.is_active + " );";
        
        req_sql(req_insert)

        
    }
}

const coinmarketcap_map = async () =>{ 
    const params = {

    }
    
    console.log(params);
    axios.get('https://web-api.coinmarketcap.com/v1/cryptocurrency/map', {params}).then(response => {

            update_map(response.data);

        }).catch(error => {

            console.log("erreur API");
            console.log(error)
        });   

}


// ================================================================== //
                           //  MAIN // 
// ================================================================== //

api_list_action() // Met a jour la liste des tickers et action composant
coinmarketcap_map() // Met à jour la liste des cryptos