#!/usr/bin/python
# -*- coding: utf-8 -*-

from flask import Flask, session, redirect, url_for, escape, request, Response, render_template, make_response, jsonify
import sqlite3
import logging
import os
import sys
# korjaa tähän polku oikeaan paikkaan. lokia ei saa tehdä cgi-bin-kansion alaisuuteen
# varmista, että piilo-kansioon on kaikilla kirjoitusoikeus
# älä luo kansioita windowsin kautta vaan vain ja ainoastaan unix-komentoriviltä
logging.basicConfig(filename=os.path.abspath('../../piilo/flask.log'),level=logging.DEBUG)
app = Flask(__name__) 
app.debug = True


# @app.route määrää mille osoitteille tämä funktio suoritetaan
@app.route('/')
def hello_world():
    return Response("Hello World", content_type="text/plain; charset=UTF-8")

@app.route('/hae_tietokanta', methods=['POST', 'GET']) 
def hae_tietokanta():
    logging.debug("aloita yhteys")
    con = sqlite3.connect(os.path.abspath('../../cgi-bin/vt5/video')) # korjaa tähän oikea polku tietokantaasi
    
    cur = con.cursor()
    logging.debug("aloita execute")
    sql = """
    SELECT j.Nimi, e.Nimi, v.VuokrausPVM, v.PalautusPVM, v.Maksettu
    FROM Vuokraus v
    INNER JOIN Jasen j ON v.JasenID=j.JasenID
    INNER JOIN Elokuva e ON v.ElokuvaID=e.ElokuvaID;
    """
    cur = con.cursor()
    try:
        cur.execute(sql)
        logging.debug("execute ok")
    except:
        logging.debug( "Kysely ei onnistu" )
        logging.debug( sys.exc_info()[0] )
    
    vuokrat = []
    for row in cur.fetchall():
        # luo lennosta aina uuden dictin, joka sisältää yhden tietueen tiedot
        vuokrat.append( dict(jasenid=row[0], elokuvaid=row[1], vuokrapvm=row[2], palautuspvm=row[3], maksettu=row[4]) )
    #logging.debug(vuokrat)
    return render_template('vuokraukset.html', vuokrat=vuokrat)
    con.close()
    
@app.route('/lisaa_tietokantaan', methods=['POST', 'GET']) 
def lisaa_tietokantaan():
    koppi = {}
    tmp = request.form.getlist('data[]')
    
    logging.debug(tmp)
    
    koppi['elokuvaid'] = int(tmp[0])
    koppi['jasenid'] = int(tmp[1])
    if tmp[2]:
        koppi['vpvm'] = str(tmp[2])
    koppi['ppvm'] = str(tmp[3])
    if tmp[4]:
        koppi['sum'] =  int(tmp[4])
    
    logging.debug(koppi)
    

    ###########################################################
    # use default values for vpvm, sum if they are NULL
    sqllausevalinta = 0
    if tmp[2]:
        sqllausevalinta += 1
    if tmp[4]:
        sqllausevalinta += 2
                
    if sqllausevalinta == 0:
        data = {"jasenid":koppi['jasenid'] , "elokuvaid":koppi['elokuvaid'], "ppvm":koppi['ppvm']}
        sql = """
        INSERT INTO Vuokraus (JasenID, ElokuvaID, PalautusPVM)
        VALUES (:jasenid, :elokuvaid, :ppvm)
        """
    if sqllausevalinta == 1:
        data = {"jasenid":koppi['jasenid'] , "elokuvaid":koppi['elokuvaid'] , "vpvm":koppi['vpvm'] , "ppvm":koppi['ppvm']}
        sql = """
        INSERT INTO Vuokraus (JasenID, ElokuvaID, VuokrausPVM, PalautusPVM)
        VALUES (:jasenid, :elokuvaid, :vpvm, :ppvm)
        """
    if sqllausevalinta == 2:
        data = {"jasenid":koppi['jasenid'] , "elokuvaid":koppi['elokuvaid'], "ppvm":koppi['ppvm'] , "sum":koppi['sum']}
        sql = """
        INSERT INTO Vuokraus (JasenID, ElokuvaID, PalautusPVM, Maksettu)
        VALUES (:jasenid, :elokuvaid, :ppvm, :sum)
        """
    if sqllausevalinta == 3:
        data = {"jasenid":koppi['jasenid'] , "elokuvaid":koppi['elokuvaid'] , "vpvm":koppi['vpvm'] , "ppvm":koppi['ppvm'] , "sum":koppi['sum']}
        sql = """
        INSERT INTO Vuokraus (JasenID, ElokuvaID, VuokrausPVM, PalautusPVM, Maksettu)
        VALUES (:jasenid, :elokuvaid, :vpvm, :ppvm, :sum)
        """

    logging.debug("sql = " + sql)
    try:
        # sqlite haluaa absoluuttisen polun
        # varmista, että polku on oikein!
        con = sqlite3.connect(os.path.abspath('../../cgi-bin/vt5/video'))
    except Exception as e:
        logging.debug("Kanta ei aukea")
        # sqliten antama virheilmoitus:
        logging.debug(str(e))
    cur = con.cursor()
    try:
        cur.execute(sql, data)
        logging.debug("execute ok")
    except:
        # vaatii koodin alkuun rivin: import sys
        logging.debug(sys.exc_info()[0])
        logging.debug(sys.exc_info()[1])
        logging.debug("ei voitu kirjoittaa tietokantaan")
        return Response("Vuokraus jo tietokannassa", content_type="text/plain; charset=UTF-8")
    try:
        con.commit()
    except:
        logging.debug('commit fail')
    con.close()
    return Response("", content_type="text/plain; charset=UTF-8")
if __name__ == '__main__':
    app.debug = True
    app.run(debug=True)