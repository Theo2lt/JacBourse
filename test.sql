use bourse;

select * from mysql.user;

/*======================================================================*/
					   /* Remise à Zero des tables */
/*======================================================================*/

TRUNCATE TABLE cryptos_list;
TRUNCATE TABLE cryptos_values;

TRUNCATE TABLE action_values;
TRUNCATE TABLE action_tickers;
TRUNCATE TABLE action_composants;

/*======================================================================*/
							/* Selection actions */
/*======================================================================*/

select * from action_values;
select * from action_values where symbol = "XNGS:GOOGL";	
SELECT * FROM action_values where symbol like '%MSFT' order by timestamp desc limit 1 ;

select * from action_tickers;
select * from action_tickers where mic ="XPAR";
select * from action_tickers where symbol = "XNGS:GOOGL";
SELECT * FROM action_tickers WHERE name IS NOT NULL &&  symbol IS NOT NULL &&  symbol = "XPAR"  &&  ticker IS NOT NULL ;
SELECT * FROM action_tickers WHERE name IS NOT NULL;

select * from action_tickers Where symbol = "XAMS%AALB";
select * from action_tickers inner join values_indices on values_indices.symbol = tickers.symbol;
SELECT * FROM action_tickers WHERE name  IS NOT NULL &&  symbol IS NOT NULL &&  mic IS NOT NULL &&  ticker = "XPAR:CA";
select * from action_tickers where symbol = ("XPAR:PX1" OR "XPAR:PX4" OR "XETR:DAX" OR "XNYS:DJI" OR "XNAS:NDX") ;

SELECT open,high,low,close,volume,resolution,market_cap,devise,symbol,timestamp FROM action_values WHERE symbol = "BTC"   &&  resolution = "1d"  &&  timestamp > "1000000000"  &&  timestamp < "1700000000" ;
SELECT open,high,low,close,volume,resolution,devise,symbol,date FROM action_values WHERE symbol = "XAMS:URW"   &&  resolution = "1D" && date > 1420102800 && date < 1609491600;

select * from action_composants;
select * from action_composants; 

select name , name_market , id_isin , symbol , mic ,ticker  from action_composant INNER JOIN  tickers ON action_composant.id_isin = action_tickers.isin;
select name , name_market , id_isin , symbol , mic ,ticker  from action_composant INNER JOIN  tickers ON action_composant.id_isin = action_tickers.isin where mic = 'XAMS';
select name , name_market , id_isin , symbol , mic ,ticker  from action_composant INNER JOIN  tickers ON action_composant.id_isin = action_tickers.isin where symbol = "XPAR:CA"   &&  name_market  IS NOT NULL &&  id_isin  IS NOT NULL  ;
select name , name_market , id_isin , symbol , mic ,ticker  from action_composant INNER JOIN  tickers ON action_composant.id_isin = action_tickers.isin;


/*======================================================================*/
						/* Selection cryptos */
/*======================================================================*/

select * from cryptos_values;
select * from cryptos_values where crypto_symbol = "LTC";
select crypto_ID from cryptos_values;

select * from cryptos_list where rank_id < 1000;
select * from cryptos_list where rank_id >= 1000 AND rank_id < 1500;
select * from cryptos_list where rank_id = 1;
select * from cryptos_list;

SELECT open,high,low,close,volume,resolution,market_cap,devise,symbol,timestamp FROM cryptos_values WHERE symbol = "42"   &&  resolution = "1d"  &&  timestamp > "1000000000"  &&  timestamp < "1700000000" ;

select * from logs;
