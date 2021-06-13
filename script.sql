drop database if exists bourse;
DROP USER if exists 'adminDB_JACQUARD'@'%';
DROP USER if exists 'api'@'%';

create database bourse; /* CREATION DE LA BASE DE DONNEE*/
use bourse;

#Création de nos utilisateur SQL
#Prend la syntaxe :

CREATE USER 'adminDB_JACQUARD'@'%' IDENTIFIED BY 'zz42988';
CREATE USER 'api'@'%' IDENTIFIED BY 'Bourse75'; 


#ACCES AUX PRIVILEGES
GRANT ALL ON *.* TO 'adminDB_JACQUARD'@'%';
GRANT ALL ON *.* TO 'api'@'%';
/* Creation d'un script de création de notre base de donnée et de ses tables, nous allons ici y inclure des tests d'insertion afin de tester les tables*/

/*======================================================================*/
/*LOGS*/
/*======================================================================*/
drop table if exists logs;
create table logs (
	date datetime, /*date de la requet*/
        adress VARCHAR(100),/* adresse ip du client */
        method VARCHAR(10),/* exemple : post,get ...  */
	url VARCHAR(200),/*  chemin que le client a demandé */
	statusCode VARCHAR(200),/* 200si OK et 400 si erreur */
        user_agent VARCHAR(500)/* information du logiciel client  */
        );
/*======================================================================*/
/*BOURSE STANDARD*/
/*======================================================================*/


/*Creation de la table ticker AFIN de connaitre le nom des actions ;*/
drop table if exists action_tickers;
create table action_tickers (
        name varchar (100), /* Nom action */
        symbol varchar(25), /* Symbole = mic + ticker */
        mic varchar(15), /* Codes d'identification des marchés */

        /*
        L'ISO 10383 est une norme de l'Organisation internationale de normalisation chargé de définir les codes
        nécessaires aux échanges sur les marchés boursiers règlementés et non règlementés pour faciliter le traitement automatisé des données.
        Ces codes d'identification des marchés sont appelés en anglais Market Identification Code ou MIC.
        */

        ticker varchar(12), /* Code Ticker*/
        isin varchar(15), /* identifiant international des valeurs mobilières */
        PRIMARY KEY (name));

/* CREATION DE LA CLE ETRANGERE
ALTER TABLE ticker ADD FOREIGN KEY (mic) REFERENCES exchange(mic); */

/* Creation de la table end_of_day AFIN de stocker les cotations */
drop table if exists action_values ;
create table action_values(
        ID varchar(40), /* ID = symbol + devise + date*/

        open double,
        high double,
        low double,
        close double,

        volume double,

        resolution varchar(9), /* interval de temps...) */

        devise varchar(12), /* Devise Action*/
	symbol varchar(12), /* Symbole Action */

        timestamp int,
        date datetime, 
        PRIMARY KEY (ID));

drop table if exists action_composant;
create table action_composants(
	id varchar(35), /* ISIN + NAME */
	name_market varchar(20), /* nom de la list des composants */
	id_isin varchar(15), /* identifiant international des valeurs mobilières */
        c_symbol varchar(12), /* Symbole Action */
        PRIMARY KEY (id)
);

/*============================================================================*/
drop table  if exists client ;
create table client (
        ID int AUTO_INCREMENT,
        nom varchar(25),
        email varchar (100),
        prenom varchar(25),
        anniv DATE,
        mdp varchar(100),
        numtel int(11),
        porte_feuille bigint(20),
        nbACT double,
        PRIMARY KEY (ID));

 /*============================================================================================================*/
/*CETTE TABLE SERT DE SUIVIE DES ACHATS ET VENTE*/
 drop table if exists Investissements;
 create table Investissements (
         dateAchat TIMESTAMP,
         #TEXT AFIN D EVITER LES PROBELMES DU TYPE DATA TOO LONG....
         nomAction TEXT,
         nbAction varchar (5000),
         ID_client int NOT NULL AUTO_INCREMENT,
         #statue -> achat ou vente
         statue TEXT,
         FOREIGN KEY (ID_client) REFERENCES client(ID),
         PRIMARY KEY (ID_client, dateAchat));

 /*YYYY-MM-DD hh: mm: ss => format date time*/

 /*Test de la table client en insérant des données*/

 /* les clés primaires, qui ont déjà été survolées lors du chapitre sur la création d'une table, et qui servent à identifier une ligne de manière unique
 les clés étrangères, qui permettent de gérer des relations entre plusieurs tables, et garantissent la cohérence des données.*/



 /* CREATION 1 (cryptos_values) */
 drop table if exists cryptos_values;
 create table cryptos_values(
       id varchar(30),
       symbol varchar(10), /* Symbole de la crypto */
       devise varchar(10), /* devise fiat */

       resolution varchar(9), /* interval de temps... 1h , 1d , 7d , 30d , 365d (Impossible de mettre inverall avec un seul "l") */

       open double, /* valeur ouverture */
       high double, /* valeur haute */
       low double, /* valeur basse */
       close double, /* valeur fermeture */

       volume double, /* Volume d'échange */
       market_cap double, /* Valeur du marché */
       
       timestamp int,
       date datetime, 

       PRIMARY KEY (id)
        );
    
    /* Liste des cryptomonnaies disponible à partir de notre système.*/
drop table if exists cryptos_list;
create table cryptos_list(
        id int, /* CLE PRIMAIRE*/
        name longtext,
        symbol varchar(20),
        rang int,
        is_active int,
        PRIMARY KEY (id)
    );