// schools.js — roster de las 96 aulas de Ronda 1 y 2 (seguimiento de largo plazo 2026).
// Generado desde data/sample/Final Treatment Assignment Round 1 and 2.csv
const SCHOOLS_BY_LOCALIDAD = {
  "ANTONIO NARIÑO": [
    {
      "colegio": "COLEGIO ATANASIO GIRARDOT (IED)",
      "sede": "ATANASIO GIRARDOT",
      "jornada": "MAÑANA",
      "clase": "903",
      "grado": "9",
      "dane": "111001012602",
      "dane12": "111001012602",
      "classid": "111001012602-MAÑANA-0903",
      "n_roster": 34
    },
    {
      "colegio": "COLEGIO GUILLERMO LEON VALENCIA (IED)",
      "sede": "GUILLERMO LEON VALENCIA",
      "jornada": "ÚNICA",
      "clase": "901",
      "grado": "9",
      "dane": "111001011053",
      "dane12": "111001011053",
      "classid": "111001011053-ÚNICA-0901",
      "n_roster": 31
    }
  ],
  "BARRIOS UNIDOS": [
    {
      "colegio": "COLEGIO FEMENINO LORENCITA VILLEGAS DE SANTOS (IED)",
      "sede": "SEDE A",
      "jornada": "ÚNICA",
      "clase": "701",
      "grado": "7",
      "dane": "11100100061201",
      "dane12": "111001000612",
      "classid": "111001000612-ÚNICA-0701",
      "n_roster": 27
    },
    {
      "colegio": "COLEGIO JUAN FRANCISCO BERBEO (IED)",
      "sede": "JUAN FRANCISCO BERBEO",
      "jornada": "ÚNICA",
      "clase": "702",
      "grado": "7",
      "dane": "11100102991201",
      "dane12": "111001029912",
      "classid": "111001029912-ÚNICA-0702",
      "n_roster": 39
    }
  ],
  "BOSA": [
    {
      "colegio": "COLEGIO BICENTENARIO DE LA INDEPENDENCIA (IED)",
      "sede": "COLEGIO BICENTENARIO DE LA INDEPENDENCIA (IED) - SEDE PRINCIPAL",
      "jornada": "ÚNICA",
      "clase": "802",
      "grado": "8",
      "dane": "111001800457",
      "dane12": "111001800457",
      "classid": "111001800457-ÚNICA-0802",
      "n_roster": 40
    },
    {
      "colegio": "COLEGIO CARLOS PIZARRO LEON GOMEZ (IED)",
      "sede": "CARLOS PIZARRO LEON GOMEZ",
      "jornada": "MAÑANA",
      "clase": "5M0706",
      "grado": "7",
      "dane": "11100110432901",
      "dane12": "111001104329",
      "classid": "111001104329-MAÑANA-5M0706",
      "n_roster": 33
    },
    {
      "colegio": "COLEGIO CEDID SAN PABLO (IED)",
      "sede": "SAN PABLO BOSA",
      "jornada": "MAÑANA",
      "clase": "901",
      "grado": "9",
      "dane": "11100101003101",
      "dane12": "111001010031",
      "classid": "111001010031-MAÑANA-0901",
      "n_roster": 44
    },
    {
      "colegio": "COLEGIO CIUDADELA EDUCATIVA DE BOSA (IED)",
      "sede": "CIUDADELA EDUCATIVA DE BOSA",
      "jornada": "TARDE",
      "clase": "704",
      "grado": "7",
      "dane": "11100110787501",
      "dane12": "111001107875",
      "classid": "111001107875-TARDE-0704",
      "n_roster": 32
    },
    {
      "colegio": "COLEGIO DE LA BICI (IED)",
      "sede": "DE LA BICI",
      "jornada": "ÚNICA",
      "clase": "702",
      "grado": "7",
      "dane": "11100180064301",
      "dane12": "111001800643",
      "classid": "111001800643-ÚNICA-0702",
      "n_roster": 40
    },
    {
      "colegio": "COLEGIO EL PORVENIR (IED)",
      "sede": "EL RECUERDO",
      "jornada": "TARDE",
      "clase": "901",
      "grado": "9",
      "dane": "21110200024303",
      "dane12": "211102000243",
      "classid": "211102000243-TARDE-0901",
      "n_roster": 20
    },
    {
      "colegio": "COLEGIO FRANCISCO DE PAULA SANTANDER (IED)",
      "sede": "FRANCISCO DE PAULA SANTANDER",
      "jornada": "TARDE",
      "clase": "901",
      "grado": "9",
      "dane": "11110200062101",
      "dane12": "111102000621",
      "classid": "111102000621-TARDE-0901",
      "n_roster": 31
    },
    {
      "colegio": "COLEGIO JOSE ANTONIO GALAN (IED)",
      "sede": "JOSE ANTONIO GALAN",
      "jornada": "TARDE",
      "clase": "701",
      "grado": "7",
      "dane": "11100104659101",
      "dane12": "111001046591",
      "classid": "111001046591-TARDE-0701",
      "n_roster": 37
    },
    {
      "colegio": "COLEGIO JOSE FRANCISCO SOCARRAS (IED)",
      "sede": "JOSE FRANCISCO SOCARRAS",
      "jornada": "MAÑANA",
      "clase": "701",
      "grado": "7",
      "dane": "11100110696801",
      "dane12": "111001106968",
      "classid": "111001106968-MAÑANA-0701",
      "n_roster": 39
    },
    {
      "colegio": "COLEGIO KIMI PERNIA DOMICO (IED)",
      "sede": "KIMI PERNIA DOMICO",
      "jornada": "TARDE",
      "clase": "704",
      "grado": "7",
      "dane": "11100110786701",
      "dane12": "111001107867",
      "classid": "111001107867-TARDE-0704",
      "n_roster": 33
    },
    {
      "colegio": "COLEGIO LEONARDO POSADA PEDRAZA (IED)",
      "sede": "LEONARDO POSADA PEDRAZA",
      "jornada": "MAÑANA",
      "clase": "703",
      "grado": "7",
      "dane": "11100110418301",
      "dane12": "111001104183",
      "classid": "111001104183-MAÑANA-0703",
      "n_roster": 41
    },
    {
      "colegio": "COLEGIO LOS NARANJOS (IED)",
      "sede": "COLEGIO LOS NARANJOS (IED) - SEDE PRINCIPAL",
      "jornada": "ÚNICA",
      "clase": "702",
      "grado": "7",
      "dane": "11100109888401",
      "dane12": "111001098884",
      "classid": "111001098884-ÚNICA-0702",
      "n_roster": 36
    },
    {
      "colegio": "COLEGIO ORLANDO HIGUITA ROJAS (IED)",
      "sede": "ORLANDO HIGUITA ROJAS",
      "jornada": "TARDE",
      "clase": "702",
      "grado": "7",
      "dane": "11100110430201",
      "dane12": "111001104302",
      "classid": "111001104302-TARDE-0702",
      "n_roster": 39
    },
    {
      "colegio": "COLEGIO SAN BERNARDINO (IED)",
      "sede": "SAN BERNARDINO",
      "jornada": "MAÑANA",
      "clase": "702",
      "grado": "7",
      "dane": "21110200020101",
      "dane12": "211102000201",
      "classid": "211102000201-MAÑANA-0702",
      "n_roster": 35
    },
    {
      "colegio": "COLEGIO SANTIAGO DE LAS ATALAYAS (IED)",
      "sede": "COLEGIO SANTIAGO DE LAS ATALAYAS (IED) - SEDE PRINCIPAL",
      "jornada": "ÚNICA",
      "clase": "802",
      "grado": "8",
      "dane": "11100110007201",
      "dane12": "111001100072",
      "classid": "111001100072-ÚNICA-0802",
      "n_roster": 42
    }
  ],
  "CIUDAD BOLIVAR": [
    {
      "colegio": "COLEGIO ANGELA RESTREPO MORENO (IED)",
      "sede": "COLEGIO ANGELA RESTREPO MORENO (IED) - SEDE PRINCIPAL",
      "jornada": "ÚNICA",
      "clase": "902",
      "grado": "9",
      "dane": "11100180057101",
      "dane12": "111001800571",
      "classid": "111001800571-ÚNICA-0902",
      "n_roster": 43
    },
    {
      "colegio": "COLEGIO ARBORIZADORA ALTA (IED)",
      "sede": "ARBORIZADORA ALTA",
      "jornada": "TARDE",
      "clase": "801",
      "grado": "8",
      "dane": "11100104757101",
      "dane12": "111001047571",
      "classid": "111001047571-TARDE-0801",
      "n_roster": 39
    },
    {
      "colegio": "COLEGIO CIUDAD BOLIVAR - ARGENTINA (IED)",
      "sede": "CIUDAD BOLIVAR",
      "jornada": "MAÑANA",
      "clase": "802",
      "grado": "8",
      "dane": "11100109655501",
      "dane12": "111001096555",
      "classid": "111001096555-MAÑANA-0802",
      "n_roster": 39
    },
    {
      "colegio": "COLEGIO CONFEDERACION BRISAS DEL DIAMANTE (IED)",
      "sede": "CONFEDERACION SUIZA",
      "jornada": "TARDE",
      "clase": "702",
      "grado": "7",
      "dane": "11100108658401",
      "dane12": "111001086584",
      "classid": "111001086584-TARDE-0702",
      "n_roster": 33
    },
    {
      "colegio": "COLEGIO GIMNASIO SABIO CALDAS (IED)",
      "sede": "COLEGIO GIMNASIO SABIO CALDAS (IED) - SEDE PRINCIPAL",
      "jornada": "ÚNICA",
      "clase": "701",
      "grado": "7",
      "dane": "11100110002101",
      "dane12": "111001100021",
      "classid": "111001100021-ÚNICA-0701",
      "n_roster": 45
    },
    {
      "colegio": "COLEGIO RAFAEL URIBE URIBE (IED)",
      "sede": "RAFAEL URIBE URIBE",
      "jornada": "MAÑANA",
      "clase": "902",
      "grado": "9",
      "dane": "11100101452401",
      "dane12": "111001014524",
      "classid": "111001014524-MAÑANA-0902",
      "n_roster": 40
    },
    {
      "colegio": "COLEGIO SANTA BARBARA (IED)",
      "sede": "COMPARTIR MEISSEN",
      "jornada": "MAÑANA",
      "clase": "801",
      "grado": "8",
      "dane": "111001030821",
      "dane12": "111001030821",
      "classid": "111001030821-MAÑANA-0801",
      "n_roster": 22
    },
    {
      "colegio": "COLEGIO TECNICO CEDID GUILLERMO CANO ISAZA (IED)",
      "sede": "TECNICO CEDID GUILLERMO CANO ISAZA",
      "jornada": "TARDE",
      "clase": "802",
      "grado": "8",
      "dane": "11100104438501",
      "dane12": "111001044385",
      "classid": "111001044385-TARDE-0802",
      "n_roster": 29
    },
    {
      "colegio": "COLEGIO VILLAMAR (IED)",
      "sede": "VILLA GLORIA",
      "jornada": "ÚNICA",
      "clase": "801",
      "grado": "8",
      "dane": "11100104666301",
      "dane12": "111001046663",
      "classid": "111001046663-ÚNICA-0801",
      "n_roster": 25
    }
  ],
  "ENGATIVA": [
    {
      "colegio": "COLEGIO CHARRY (IED)",
      "sede": "CHARRY",
      "jornada": "MAÑANA",
      "clase": "702",
      "grado": "7",
      "dane": "11100110890101",
      "dane12": "111001108901",
      "classid": "111001108901-MAÑANA-0702",
      "n_roster": 33
    },
    {
      "colegio": "COLEGIO LA PALESTINA (IED)",
      "sede": "CENTRO DE ESTUDIOS DEL NIÑO",
      "jornada": "ÚNICA",
      "clase": "902",
      "grado": "9",
      "dane": "11126500001701",
      "dane12": "111265000017",
      "classid": "111265000017-ÚNICA-0902",
      "n_roster": 29
    },
    {
      "colegio": "COLEGIO MAGDALENA ORTEGA DE NARIÑO (IED)",
      "sede": "MAGDALENA ORTEGA DE NARIÑO",
      "jornada": "TARDE",
      "clase": "701",
      "grado": "7",
      "dane": "11100101779501",
      "dane12": "111001017795",
      "classid": "111001017795-TARDE-0701",
      "n_roster": 28
    },
    {
      "colegio": "COLEGIO REPUBLICA DE CHINA (IED)",
      "sede": "REPUBLICA DE CHINA",
      "jornada": "MAÑANA",
      "clase": "701",
      "grado": "7",
      "dane": "11100101581401",
      "dane12": "111001015814",
      "classid": "111001015814-MAÑANA-0701",
      "n_roster": 35
    },
    {
      "colegio": "COLEGIO SIMON BOLIVAR (IED)",
      "sede": "SIMON BOLIVAR",
      "jornada": "MAÑANA",
      "clase": "702",
      "grado": "7",
      "dane": "111265000394",
      "dane12": "111265000394",
      "classid": "111265000394-MAÑANA-0702",
      "n_roster": 38
    },
    {
      "colegio": "COLEGIO TOMAS CIPRIANO DE MOSQUERA (IED)",
      "sede": "TOMAS CIPRIANO DE MOSQUERA",
      "jornada": "MAÑANA",
      "clase": "704",
      "grado": "7",
      "dane": "111001108456",
      "dane12": "111001108456",
      "classid": "111001108456-MAÑANA-0704",
      "n_roster": 42
    }
  ],
  "FONTIBON": [
    {
      "colegio": "COLEGIO CARLO FEDERICI (IED)",
      "sede": "CARLO FEDERICI",
      "jornada": "MAÑANA",
      "clase": "801",
      "grado": "8",
      "dane": "11100110427201",
      "dane12": "111001104272",
      "classid": "111001104272-MAÑANA-0801",
      "n_roster": 37
    },
    {
      "colegio": "COLEGIO PABLO NERUDA (IED)",
      "sede": "PABLO NERUDA",
      "jornada": "TARDE",
      "clase": "701",
      "grado": "7",
      "dane": "11100110219901",
      "dane12": "111001102199",
      "classid": "111001102199-TARDE-0701",
      "n_roster": 31
    }
  ],
  "KENNEDY": [
    {
      "colegio": "COLEGIO CLASS (IED)",
      "sede": "CLASS",
      "jornada": "MAÑANA",
      "clase": "701",
      "grado": "7",
      "dane": "11100101312901",
      "dane12": "111001013129",
      "classid": "111001013129-MAÑANA-0701",
      "n_roster": 39
    },
    {
      "colegio": "COLEGIO DARIO ECHANDIA (IED)",
      "sede": "DARIO ECHANDIA",
      "jornada": "TARDE",
      "clase": "701",
      "grado": "7",
      "dane": "11100100127901",
      "dane12": "111001001279",
      "classid": "111001001279-TARDE-0701",
      "n_roster": 35
    },
    {
      "colegio": "COLEGIO FELIZA BURSZTYN (IED)",
      "sede": "COLEGIO FELIZA BURSZTYN (IED)",
      "jornada": "ÚNICA",
      "clase": "702",
      "grado": "7",
      "dane": "11100180124101",
      "dane12": "111001801241",
      "classid": "111001801241-ÚNICA-0702",
      "n_roster": 39
    },
    {
      "colegio": "COLEGIO FRANCISCO DE MIRANDA (IED)",
      "sede": "FRANCISCO DE MIRANDA",
      "jornada": "TARDE",
      "clase": "801",
      "grado": "8",
      "dane": "11100101497401",
      "dane12": "111001014974",
      "classid": "111001014974-TARDE-0801",
      "n_roster": 30
    },
    {
      "colegio": "COLEGIO HERNANDO DURAN DUSSAN (IED)",
      "sede": "HERNANDO DURAN DUSSAN",
      "jornada": "ÚNICA",
      "clase": "805",
      "grado": "8",
      "dane": "11100110004801",
      "dane12": "111001100048",
      "classid": "111001100048-ÚNICA-0805",
      "n_roster": 40
    },
    {
      "colegio": "COLEGIO INSTITUTO TECNICO RODRIGO DE TRIANA (IED)",
      "sede": "RODRIGO DE TRIANA",
      "jornada": "MAÑANA",
      "clase": "801",
      "grado": "8",
      "dane": "11100108677101",
      "dane12": "111001086771",
      "classid": "111001086771-MAÑANA-0801",
      "n_roster": 39
    },
    {
      "colegio": "COLEGIO JACKELINE (IED)",
      "sede": "SEDE B",
      "jornada": "TARDE",
      "clase": "5T0801",
      "grado": "8",
      "dane": "11100102911402",
      "dane12": "111001029114",
      "classid": "111001029114-TARDE-5T0801",
      "n_roster": 29
    },
    {
      "colegio": "COLEGIO JAIRO ANIBAL NIÑO (CED)",
      "sede": "JAIRO ANIBAL NIÑO",
      "jornada": "TARDE",
      "clase": "701",
      "grado": "7",
      "dane": "11100102740501",
      "dane12": "111001027405",
      "classid": "111001027405-TARDE-0701",
      "n_roster": 33
    },
    {
      "colegio": "COLEGIO LAS AMERICAS (IED)",
      "sede": "LAS AMERICAS",
      "jornada": "MAÑANA",
      "clase": "704",
      "grado": "7",
      "dane": "11100101559801",
      "dane12": "111001015598",
      "classid": "111001015598-MAÑANA-0704",
      "n_roster": 26
    },
    {
      "colegio": "COLEGIO TOM ADAMS (IED)",
      "sede": "TOM ADAMS",
      "jornada": "ÚNICA",
      "clase": "703",
      "grado": "7",
      "dane": "11100101234301",
      "dane12": "111001012343",
      "classid": "111001012343-ÚNICA-0703",
      "n_roster": 34
    },
    {
      "colegio": "COLEGIO VILLA RICA (IED)",
      "sede": "VILLA RICA",
      "jornada": "MAÑANA",
      "clase": "701",
      "grado": "7",
      "dane": "11100107915401",
      "dane12": "111001079154",
      "classid": "111001079154-MAÑANA-0701",
      "n_roster": 29
    },
    {
      "colegio": "COLEGIO VILLA RICA (IED)",
      "sede": "VILLA RICA",
      "jornada": "TARDE",
      "clase": "702",
      "grado": "7",
      "dane": "11100107915401",
      "dane12": "111001079154",
      "classid": "111001079154-TARDE-0702",
      "n_roster": 34
    }
  ],
  "LA CANDELARIA": [
    {
      "colegio": "COLEGIO INTEGRADA LA CANDELARIA (IED)",
      "sede": "LA CONCORDIA",
      "jornada": "MAÑANA",
      "clase": "802",
      "grado": "8",
      "dane": "111001013323",
      "dane12": "111001013323",
      "classid": "111001013323-MAÑANA-0802",
      "n_roster": 29
    }
  ],
  "LOS MARTIRES": [
    {
      "colegio": "COLEGIO LICEO NACIONAL ANTONIA SANTOS (IED)",
      "sede": "ANTONIA SANTOS",
      "jornada": "MAÑANA",
      "clase": "901",
      "grado": "9",
      "dane": "11100101952601",
      "dane12": "111001019526",
      "classid": "111001019526-MAÑANA-0901",
      "n_roster": 35
    },
    {
      "colegio": "COLEGIO PANAMERICANO (IED)",
      "sede": "PANAMERICANO",
      "jornada": "TARDE",
      "clase": "701",
      "grado": "7",
      "dane": "11100103085601",
      "dane12": "111001030856",
      "classid": "111001030856-TARDE-0701",
      "n_roster": 18
    },
    {
      "colegio": "COLEGIO RICAURTE (IED)",
      "sede": "RICAURTE",
      "jornada": "ÚNICA",
      "clase": "901",
      "grado": "9",
      "dane": "11100104145901",
      "dane12": "111001041459",
      "classid": "111001041459-ÚNICA-0901",
      "n_roster": 32
    },
    {
      "colegio": "ESCUELA TECNOLOGICA INSTITUTO TECNICO CENTRAL",
      "sede": "",
      "jornada": "COMPLETA",
      "clase": "906",
      "grado": "9",
      "dane": "11100102040101",
      "dane12": "111001020401",
      "classid": "111001020401-COMPLETA-0906",
      "n_roster": 31
    }
  ],
  "PUENTE ARANDA": [
    {
      "colegio": "COLEGIO ANTONIO JOSE DE SUCRE (IED)",
      "sede": "ANTONIO JOSE DE SUCRE",
      "jornada": "ÚNICA",
      "clase": "701",
      "grado": "7",
      "dane": "111001014745",
      "dane12": "111001014745",
      "classid": "111001014745-ÚNICA-0701",
      "n_roster": 38
    },
    {
      "colegio": "COLEGIO EL JAZMIN (IED)",
      "sede": "EL JAZMIN",
      "jornada": "MAÑANA",
      "clase": "702",
      "grado": "7",
      "dane": "11100101253001",
      "dane12": "111001012530",
      "classid": "111001012530-MAÑANA-0702",
      "n_roster": 29
    },
    {
      "colegio": "COLEGIO JOSE MANUEL RESTREPO (IED)",
      "sede": "JOSE MANUEL RESTREPO",
      "jornada": "ÚNICA",
      "clase": "802",
      "grado": "8",
      "dane": "111001045535",
      "dane12": "111001045535",
      "classid": "111001045535-ÚNICA-0802",
      "n_roster": 30
    },
    {
      "colegio": "COLEGIO TECNICO BENJAMIN HERRERA (IED)",
      "sede": "BENJAMIN HERRERA",
      "jornada": "MAÑANA",
      "clase": "704",
      "grado": "7",
      "dane": "11100101296301",
      "dane12": "111001012963",
      "classid": "111001012963-MAÑANA-0704",
      "n_roster": 32
    }
  ],
  "RAFAEL URIBE URIBE": [
    {
      "colegio": "COLEGIO ALEJANDRO OBREGON (IED)",
      "sede": "ALEJANDRO OBREGON",
      "jornada": "TARDE",
      "clase": "901",
      "grado": "9",
      "dane": "11100101517201",
      "dane12": "111001015172",
      "classid": "111001015172-TARDE-0901",
      "n_roster": 31
    },
    {
      "colegio": "COLEGIO BRAVO PAEZ (IED)",
      "sede": "BRAVO PAEZ",
      "jornada": "MAÑANA",
      "clase": "801",
      "grado": "8",
      "dane": "11100101261101",
      "dane12": "111001012611",
      "classid": "111001012611-MAÑANA-0801",
      "n_roster": 31
    },
    {
      "colegio": "COLEGIO COLOMBIA VIVA (IED)",
      "sede": "NESTOR FORERO ALCALA",
      "jornada": "TARDE",
      "clase": "902",
      "grado": "9",
      "dane": "11100110209101",
      "dane12": "111001102091",
      "classid": "111001102091-TARDE-0902",
      "n_roster": 27
    },
    {
      "colegio": "COLEGIO DIANA TURBAY (IED)",
      "sede": "DIANA TURBAY I",
      "jornada": "ÚNICA",
      "clase": "701",
      "grado": "7",
      "dane": "11100104161101",
      "dane12": "111001041611",
      "classid": "111001041611-ÚNICA-0701",
      "n_roster": 37
    },
    {
      "colegio": "COLEGIO GUSTAVO RESTREPO (IED)",
      "sede": "GUSTAVO RESTREPO",
      "jornada": "ÚNICA",
      "clase": "703",
      "grado": "7",
      "dane": "11100102733201",
      "dane12": "111001027332",
      "classid": "111001027332-ÚNICA-0703",
      "n_roster": 36
    },
    {
      "colegio": "COLEGIO JOSE MARTI (IED)",
      "sede": "LUIS LOPEZ DE MESA",
      "jornada": "ÚNICA",
      "clase": "901",
      "grado": "9",
      "dane": "11100103676501",
      "dane12": "111001036765",
      "classid": "111001036765-ÚNICA-0901",
      "n_roster": 33
    },
    {
      "colegio": "COLEGIO MANUEL DEL SOCORRO RODRIGUEZ (IED)",
      "sede": "MANUEL DEL SOCORRO RODRIGUEZ",
      "jornada": "MAÑANA",
      "clase": "902",
      "grado": "9",
      "dane": "11100101459101",
      "dane12": "111001014591",
      "classid": "111001014591-MAÑANA-0902",
      "n_roster": 35
    },
    {
      "colegio": "COLEGIO REPUBLICA EE.UU. DE AMERICA (IED)",
      "sede": "REPUBLICA EE.UU. DE AMERICA",
      "jornada": "ÚNICA",
      "clase": "802",
      "grado": "8",
      "dane": "111001032395",
      "dane12": "111001032395",
      "classid": "111001032395-ÚNICA-0802",
      "n_roster": 26
    },
    {
      "colegio": "COLEGIO REPUBLICA FEDERAL DE ALEMANIA (IED)",
      "sede": "REPUBLICA FEDERAL DE ALEMANIA",
      "jornada": "ÚNICA",
      "clase": "801",
      "grado": "8",
      "dane": "11100101402801",
      "dane12": "111001014028",
      "classid": "111001014028-ÚNICA-0801",
      "n_roster": 30
    },
    {
      "colegio": "COLEGIO RESTREPO MILLAN (IED)",
      "sede": "RESTREPO MILLAN",
      "jornada": "ÚNICA",
      "clase": "804",
      "grado": "8",
      "dane": "111001010928",
      "dane12": "111001010928",
      "classid": "111001010928-ÚNICA-0804",
      "n_roster": 32
    },
    {
      "colegio": "COLEGIO SANTA LUCIA (IED)",
      "sede": "COLEGIO SANTA LUCIA (IED) - SEDE PRINCIPAL",
      "jornada": "ÚNICA",
      "clase": "802",
      "grado": "8",
      "dane": "111001098965",
      "dane12": "111001098965",
      "classid": "111001098965-ÚNICA-0802",
      "n_roster": 40
    }
  ],
  "SAN CRISTOBAL": [
    {
      "colegio": "COLEGIO FRANCISCO JAVIER MATIZ (IED)",
      "sede": "FRANCISCO JAVIER MATIZ",
      "jornada": "MAÑANA",
      "clase": "802",
      "grado": "8",
      "dane": "11100101834101",
      "dane12": "111001018341",
      "classid": "111001018341-MAÑANA-0802",
      "n_roster": 28
    },
    {
      "colegio": "COLEGIO JOSE JOAQUIN CASTRO MARTINEZ (IED)",
      "sede": "JOSE JOAQUIN CASTRO MARTINEZ",
      "jornada": "ÚNICA",
      "clase": "803",
      "grado": "8",
      "dane": "11100101832501",
      "dane12": "111001018325",
      "classid": "111001018325-ÚNICA-0803",
      "n_roster": 21
    },
    {
      "colegio": "COLEGIO JUAN REY (IED)",
      "sede": "JUAN REY",
      "jornada": "ÚNICA",
      "clase": "701",
      "grado": "7",
      "dane": "111001034011",
      "dane12": "111001034011",
      "classid": "111001034011-ÚNICA-0701",
      "n_roster": 39
    },
    {
      "colegio": "COLEGIO SAN JOSE SUR ORIENTAL (IED)",
      "sede": "SAN JOSE SUR ORIENTAL",
      "jornada": "MAÑANA",
      "clase": "701",
      "grado": "7",
      "dane": "11100101230101",
      "dane12": "111001012301",
      "classid": "111001012301-MAÑANA-0701",
      "n_roster": 39
    }
  ],
  "SANTAFE": [
    {
      "colegio": "COLEGIO EXTERNADO NACIONAL CAMILO TORRES (IED)",
      "sede": "CAMILO TORRES",
      "jornada": "ÚNICA",
      "clase": "702",
      "grado": "7",
      "dane": "11100101083901",
      "dane12": "111001010839",
      "classid": "111001010839-ÚNICA-0702",
      "n_roster": 43
    },
    {
      "colegio": "COLEGIO JORGE SOTO DEL CORRAL (IED)",
      "sede": "JORGE SOTO DEL CORRAL",
      "jornada": "MAÑANA",
      "clase": "803",
      "grado": "8",
      "dane": "11100103240901",
      "dane12": "111001032409",
      "classid": "111001032409-MAÑANA-0803",
      "n_roster": 22
    },
    {
      "colegio": "COLEGIO LA GIRALDA (IED)",
      "sede": "COLEGIO LA GIRALDA (IED) - SEDE PRINCIPAL",
      "jornada": "ÚNICA",
      "clase": "903",
      "grado": "9",
      "dane": "111001100030",
      "dane12": "111001100030",
      "classid": "111001100030-ÚNICA-0903",
      "n_roster": 40
    }
  ],
  "SUBA": [
    {
      "colegio": "COLEGIO ALBERTO LLERAS CAMARGO (IED)",
      "sede": "ALBERTO LLERAS CAMARGO",
      "jornada": "TARDE",
      "clase": "801",
      "grado": "8",
      "dane": "11100102502001",
      "dane12": "111001025020",
      "classid": "111001025020-TARDE-0801",
      "n_roster": 38
    },
    {
      "colegio": "COLEGIO NUEVA COLOMBIA (IED)",
      "sede": "NUEVA COLOMBIA",
      "jornada": "TARDE",
      "clase": "701",
      "grado": "7",
      "dane": "11100107527201",
      "dane12": "111001075272",
      "classid": "111001075272-TARDE-0701",
      "n_roster": 26
    }
  ],
  "TEUSAQUILLO": [
    {
      "colegio": "COLEGIO MANUELA BELTRAN (IED)",
      "sede": "MANUELA BELTRAN",
      "jornada": "ÚNICA",
      "clase": "704",
      "grado": "7",
      "dane": "11100101073101",
      "dane12": "111001010731",
      "classid": "111001010731-ÚNICA-0704",
      "n_roster": 31
    },
    {
      "colegio": "COLEGIO TECNICO PALERMO (IED)",
      "sede": "PALERMO",
      "jornada": "ÚNICA",
      "clase": "801",
      "grado": "8",
      "dane": "11100109489701",
      "dane12": "111001094897",
      "classid": "111001094897-ÚNICA-0801",
      "n_roster": 33
    }
  ],
  "TUNJUELITO": [
    {
      "colegio": "COLEGIO SAN BENITO ABAD (IED)",
      "sede": "DIANA TURBAY",
      "jornada": "MAÑANA",
      "clase": "701",
      "grado": "7",
      "dane": "11100108663101",
      "dane12": "111001086631",
      "classid": "111001086631-MAÑANA-0701",
      "n_roster": 30
    },
    {
      "colegio": "COLEGIO SAN CARLOS (IED)",
      "sede": "SAN CARLOS",
      "jornada": "MAÑANA",
      "clase": "801",
      "grado": "8",
      "dane": "11100107595702",
      "dane12": "111001075957",
      "classid": "111001075957-MAÑANA-0801",
      "n_roster": 36
    }
  ],
  "USAQUEN": [
    {
      "colegio": "COLEGIO AGUSTIN FERNANDEZ (IED)",
      "sede": "AGUSTIN FERNANDEZ",
      "jornada": "ÚNICA",
      "clase": "704",
      "grado": "7",
      "dane": "111001029955",
      "dane12": "111001029955",
      "classid": "111001029955-ÚNICA-0704",
      "n_roster": 37
    },
    {
      "colegio": "COLEGIO DIVINO MAESTRO (IED)",
      "sede": "DIVINO MAESTRO",
      "jornada": "TARDE",
      "clase": "705",
      "grado": "7",
      "dane": "11184800268902",
      "dane12": "111848002689",
      "classid": "111848002689-TARDE-0705",
      "n_roster": 36
    },
    {
      "colegio": "COLEGIO LA ESTRELLITA (IED)",
      "sede": "COLEGIO LA ESTRELLITA (IED) - SEDE PRINCIPAL",
      "jornada": "ÚNICA",
      "clase": "701",
      "grado": "7",
      "dane": "11100109861201",
      "dane12": "111001098612",
      "classid": "111001098612-ÚNICA-0701",
      "n_roster": 45
    },
    {
      "colegio": "COLEGIO NUEVO HORIZONTE (IED)",
      "sede": "NUEVO HORIZONTE",
      "jornada": "MAÑANA",
      "clase": "702",
      "grado": "7",
      "dane": "11100108668101",
      "dane12": "111001086681",
      "classid": "111001086681-MAÑANA-0702",
      "n_roster": 31
    },
    {
      "colegio": "COLEGIO SALUDCOOP NORTE (IED)",
      "sede": "SALUDCOOP NORTE",
      "jornada": "TARDE",
      "clase": "701",
      "grado": "7",
      "dane": "11100110774301",
      "dane12": "111001107743",
      "classid": "111001107743-TARDE-0701",
      "n_roster": 40
    },
    {
      "colegio": "COLEGIO USAQUEN (IED)",
      "sede": "USAQUEN",
      "jornada": "MAÑANA",
      "clase": "902",
      "grado": "9",
      "dane": "111848002662",
      "dane12": "111848002662",
      "classid": "111848002662-MAÑANA-0902",
      "n_roster": 40
    }
  ],
  "USME": [
    {
      "colegio": "COLEGIO ALMIRANTE PADILLA (IED)",
      "sede": "ALMIRANTE PADILLA",
      "jornada": "TARDE",
      "clase": "701",
      "grado": "7",
      "dane": "11185000142801",
      "dane12": "111850001428",
      "classid": "111850001428-TARDE-0701",
      "n_roster": 19
    },
    {
      "colegio": "COLEGIO CIUDAD DE VILLAVICENCIO (IED)",
      "sede": "CIUDAD DE VILLAVICENCIO",
      "jornada": "TARDE",
      "clase": "702",
      "grado": "7",
      "dane": "11100110435301",
      "dane12": "111001104353",
      "classid": "111001104353-TARDE-0702",
      "n_roster": 29
    },
    {
      "colegio": "COLEGIO EL VIRREY JOSE SOLIS (IED)",
      "sede": "EL VIRREY JOSE SOLIS",
      "jornada": "MAÑANA",
      "clase": "802",
      "grado": "8",
      "dane": "11100107863801",
      "dane12": "111001078638",
      "classid": "111001078638-MAÑANA-0802",
      "n_roster": 40
    },
    {
      "colegio": "COLEGIO ESTANISLAO ZULETA (IED)",
      "sede": "ESTANISLAO ZULETA",
      "jornada": "MAÑANA",
      "clase": "701",
      "grado": "7",
      "dane": "11100103087201",
      "dane12": "111001030872",
      "classid": "111001030872-MAÑANA-0701",
      "n_roster": 33
    },
    {
      "colegio": "COLEGIO NUEVA ESPERANZA (IED)",
      "sede": "SEDE B",
      "jornada": "MAÑANA",
      "clase": "901",
      "grado": "9",
      "dane": "11100102464302",
      "dane12": "111001024643",
      "classid": "111001024643-MAÑANA-0901",
      "n_roster": 20
    },
    {
      "colegio": "COLEGIO NUEVO SAN ANDRES DE LOS ALTOS (IED)",
      "sede": "NUEVO SAN ANDRES DE LOS ALTOS",
      "jornada": "MAÑANA",
      "clase": "701",
      "grado": "7",
      "dane": "11100104648501",
      "dane12": "111001046485",
      "classid": "111001046485-MAÑANA-0701",
      "n_roster": 35
    },
    {
      "colegio": "COLEGIO OFELIA URIBE DE ACOSTA (IED)",
      "sede": "OFELIA URIBE DE ACOSTA",
      "jornada": "TARDE",
      "clase": "803",
      "grado": "8",
      "dane": "11100107789501",
      "dane12": "111001077895",
      "classid": "111001077895-TARDE-0803",
      "n_roster": 35
    },
    {
      "colegio": "COLEGIO SAN CAYETANO (IED)",
      "sede": "SAN CAYETANO",
      "jornada": "MAÑANA",
      "clase": "803",
      "grado": "8",
      "dane": "11100109883301",
      "dane12": "111001098833",
      "classid": "111001098833-MAÑANA-0803",
      "n_roster": 31
    },
    {
      "colegio": "COLEGIO USMINIA (IED)",
      "sede": "USMINIA",
      "jornada": "ÚNICA",
      "clase": "801",
      "grado": "8",
      "dane": "11100106523401",
      "dane12": "111001065234",
      "classid": "111001065234-ÚNICA-0801",
      "n_roster": 38
    }
  ]
};
