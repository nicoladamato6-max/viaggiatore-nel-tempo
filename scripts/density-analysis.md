# Analisi di Densità degli Eventi — Viaggiatore nel Tempo
*Report generato il 14 ottobre 2026 — dati da density-report.json*

---

## 1. OVERVIEW GLOBALE

### Totali
| Metrica | Valore |
|---------|--------|
| Eventi totali | 3.968 |
| Eventi storici (non cosmici) | 3.957 |
| Eventi cosmici (`isCosmic: true`) | 11 |
| Slug Wikipedia unici analizzati | 2.482 |

### Distribuzione per disciplina (tutti gli eventi)

| Disciplina | Conteggio | % |
|------------|-----------|---|
| storia | 2.068 | 52,1% |
| arte | 623 | 15,7% |
| scienza | 612 | 15,4% |
| musica | 325 | 8,2% |
| geologia | 154 | 3,9% |
| filosofia | 133 | 3,4% |
| cosmo | 26 | 0,7% |
| sport | 27 | 0,7% |

**Squilibrio critico**: `storia` occupa il 52% del totale. `cosmo` e `sport` sono marginali (0,7% ciascuno), con `filosofia` appena al 3,4%.

### Distribuzione per tipo (tutti gli eventi)

| Tipo | Conteggio | % |
|------|-----------|---|
| persona | 1.549 | 39,0% |
| evento | 782 | 19,7% |
| opera | 735 | 18,5% |
| scoperta | 616 | 15,5% |
| movimento | 201 | 5,1% |
| luogo | 52 | 1,3% |
| organizzazione | 33 | 0,8% |

**Note**: `persona` domina il 39% del totale. `luogo` e `organizzazione` sono scarsamente rappresentati.

---

## 2. ANALISI PER MACRO-ERA

### 2.1 Era Preistorica (ere geologiche: Terra primordiale, Paleozoica, Mesozoica, Cenozoica)

Le ere pre-umane (dalla formazione della Terra al Pleistocene) contengono esclusivamente eventi `geologia`. Questo è **storicamente sensato** e non costituisce una lacuna.

| Macro-era | Totale | Popolarità mediana |
|-----------|--------|-------------------|
| Terra primordiale | 12 | 4.955 byte |
| Era Paleozoica | 15 | 13.579 byte |
| Era Mesozoica | 11 | 66.308 byte |
| Era Cenozoica | 13 | 25.385 byte |

Queste sezioni sono coerenti con la loro natura. Lacune storicamente sensate (arte, musica, storia, filosofia assenti in ere pre-umane) — **da non integrare**.

---

### 2.2 Preistoria (da -2.500.000 a -3.500)
**128 eventi**

| | storia | arte | musica | scienza | geologia | filosofia | sport |
|-|--------|------|--------|---------|----------|-----------|-------|
| Conteggio | 25 | 19 | 10 | 1 | 73 | 0 | 0 |

- **Popolarità mediana**: 8.573 byte | **P25**: 2.278 byte
- **Lacune anomale**:
  - `scienza` con solo 1 evento è sorprendente: la preistoria vide l'invenzione dell'utensile, del fuoco, dell'agricoltura — molti dei quali già presenti in altri campi ma classificati come `geologia` anziché `scienza`
  - `filosofia` assente: storicamente plausibile per il Paleolitico, **anomala** dal Neolitico in poi (pensiero religioso, chamanismo)
  - `sport`: assente — storicamente sensato per il Paleolitico ma il Neolitico e i grandi siti come Göbekli Tepe hanno rituali sportivi

- **Evento con popolarità più bassa (anomalia)**: "Monte Verde" (156 byte) — slug potenzialmente mal configurato sul Wikipedia italiano

---

### 2.3 Età Antica (da -3.500 a 476)
**492 eventi**

| | storia | arte | musica | scienza | geologia | cosmo | filosofia | sport |
|-|--------|------|--------|---------|----------|-------|-----------|-------|
| Conteggio | 337 | 50 | 21 | 27 | 16 | 0 | 32 | 9 |

- **Popolarità mediana**: 10.398 byte | **P25**: 1.530 byte
- **Lacune anomale**:
  - `cosmo` assente: l'astronomia mesopotamica (calendari, zodiaco), egiziana (allineamenti solari), greca (Eratostene, Ipparco) dovrebbe essere presente — la classificazione è errata (questi eventi esistono ma come `scienza` o `storia`)
  - `musica` con 21 eventi su 492 (4,3%) è sottorappresentata per un'epoca che va da Sumeri a Roma. La musica greca, romana, egiziana è documentata
  - `sport` con 9 eventi è accettabile (Olimpiadi antiche), ma l'Olimpiade classica meriterebbe più copertura

- **Problema critico**: 5 eventi su 5 a bassa popolarità condividono lo stesso slug Wikipedia (`Herodotus`, `Aeschylus`, `Eratosthenes`). Questo rivela un **problema di duplicati**: lo stesso slug appare più volte con titoli leggermente diversi.

---

### 2.4 Medioevo (da 476 a 1492)
**489 eventi**

| | storia | arte | musica | scienza | geologia | cosmo | filosofia | sport |
|-|--------|------|--------|---------|----------|-------|-----------|-------|
| Conteggio | 307 | 90 | 24 | 31 | 0 | 1 | 31 | 5 |

- **Popolarità mediana**: 15.590 byte | **P25**: 4.073 byte
- **Lacune anomale**:
  - `geologia` assente: plausibile (non ci sono eventi geologici attribuibili al Medioevo)
  - `cosmo` con solo 1 evento (la Supernova del 1054) è anomalo: l'astronomia medievale (Alhazen, astrolabio arabo, astronomia islamica) è storicamente rilevante
  - `sport` con 5 eventi: i tornei cavallereschi, le gare medievali, i giochi popolari meriterebbero più rappresentazione

---

### 2.5 Età Moderna (da 1492 a 1789)
**597 eventi**

| | storia | arte | musica | scienza | geologia | cosmo | filosofia | sport |
|-|--------|------|--------|---------|----------|-------|-----------|-------|
| Conteggio | 252 | 138 | 39 | 115 | 2 | 2 | 47 | 2 |

- **Popolarità mediana**: 19.807 byte | **P25**: 5.955 byte
- **Lacune anomale**:
  - `cosmo` con solo 2 eventi è gravemente sottorappresentato: Copernico, Galileo, Keplero, Newton e la rivoluzione eliocentrica sono uno dei momenti più rilevanti della storia scientifica
  - `sport` con 2 eventi è anomalo: i Giochi Olimpici moderni non esistevano ancora, ma la cultura sportiva rinascimentale (calcio fiorentino, tornei) era viva
  - Però `scienza` con 115 eventi dimostra che la Rivoluzione Scientifica è ben coperta — il problema è la classificazione (molti eventi astronomici sono in `scienza` non in `cosmo`)

---

### 2.6 Età Contemporanea (da 1789 a 2025)
**2.199 eventi (55,6% del totale storico)**

| | storia | arte | musica | scienza | geologia | cosmo | filosofia | sport |
|-|--------|------|--------|---------|----------|-------|-----------|-------|
| Conteggio | 1.147 | 326 | 231 | 438 | 6 | 18 | 22 | 11 |

- **Popolarità mediana**: 33.768 byte | **P25**: 15.832 byte
- **Lacune anomale**:
  - `filosofia` con soli 22 eventi su 2.199 (1,0%) è un'anomalia grave: l'Ottocento e il Novecento sono i secoli della filosofia moderna (Hegel, Marx, Nietzsche, Sartre, Wittgenstein, Heidegger, ecc.)
  - `sport` con 11 eventi su 2.199 (0,5%) è il gap più grave del progetto: i Giochi Olimpici moderni, la nascita del calcio, il baseball, il tennis, ecc. sono eventi di massa del XX secolo
  - `geologia` con 6 eventi è scarsa (ma storicamente meno rilevante in senso narrativo)
  - **Iperconcentrazione temporale**: oltre la metà degli eventi è in questa macro-era, con alcune epoche ultra-dense (Guerra Fredda: 560 eventi, Riv. Industriale: 600)

---

## 3. ANALISI PER SOTTOEPOCA (epoche con >10 eventi)

### 3.1 Preistoria profonda

#### Paleolitico Inferiore (-2.500.000 / -300.000) — 10 eventi
Solo geologia. Storicamente sensato. Nessuna lacuna anomala.

#### Paleolitico Medio (-300.000 / -40.000) — 27 eventi
| | storia | arte | musica | scienza | geologia |
|-|--------|------|--------|---------|----------|
| 1 | 2 | 2 | 0 | 22 |

- `scienza` assente: anomalo, la tecnologia litica del Paleolitico Medio è documentata
- `arte` con 2 eventi: le prime incisioni e ocra rossa risalgono a questo periodo (anomalo il sottorappresentato)
- **Popolarità mediana altissima**: 114.592 byte — trainata dalla pagina Homo_sapiens; P25 è solo 8.700 byte, quindi distribuzione molto sbilanciata

#### Paleolitico Superiore (-40.000 / -10.000) — 19 eventi
| | storia | arte | musica | scienza | geologia |
|-|--------|------|--------|---------|----------|
| 1 | 5 | 4 | 0 | 9 |

- `arte` con 5 eventi è **appropriato** per il periodo di Lascaux e Altamira
- `scienza` assente: storicamente plausibile (non c'è "scienza" codificata in questo periodo)
- Popolarità mediana molto bassa (1.865 byte) — possibili problemi con gli slug Wikipedia italiani

#### Mesolitico (-10.000 / -8.000) — 17 eventi
- `musica` assente: anomalo — strumenti musicali mesolitici sono documentati (flauti d'osso)

---

### 3.2 Preistoria recente e civiltà proto-storiche

#### Neolitico (-8.000 / -3.500) — 55 eventi
| | storia | arte | musica | scienza | geologia | filosofia |
|-|--------|------|--------|---------|----------|-----------|
| 20 | 10 | 4 | 1 | 20 | 0 |

- `scienza` con 1 evento è anomalo: la rivoluzione agricola, la ceramica, la metallurgia sono scoperte scientifiche
- `filosofia` assente: plausibile per il Neolitico privo di scrittura
- Buona copertura arte e storia

#### Età del Bronzo (-3.300 / -1.200) — 135 eventi
| | storia | arte | musica | scienza | filosofia | sport |
|-|--------|------|--------|---------|-----------|-------|
| 97 | 15 | 7 | 3 | 1 | 1 |

- `storia` occupa il 72% — sbilanciato
- `arte` con 15 eventi è accettabile ma potrebbe essere arricchita (arte egizia, micenea, assira)
- `filosofia` con 1 evento e `sport` con 1 evento sono sottorappresentati per un'epoca che include le Olimpiadi e i grandi testi filosofici orientali

#### Età del Ferro (-1.200 / -600) — 58 eventi
| | storia | arte | musica | scienza | filosofia | sport |
|-|--------|------|--------|---------|-----------|-------|
| 41 | 5 | 1 | 4 | 2 | 5 |

- `storia` all'81%: sbilanciato
- `arte` con 5 eventi: anomalo per un periodo che include Omero, la ceramica greca
- `musica` con 1 evento: i Fenici classificati erroneamente come `sport`
- `filosofia` con 2: nasceva la filosofia presocratica (Talete, Anassimandro)

---

### 3.3 Età Antica (sottoepoche)

#### Civiltà Mesopotamiche (-3.500 / -539) — 225 eventi
| | storia | arte | musica | scienza | cosmo | filosofia | sport |
|-|--------|------|--------|---------|-------|-----------|-------|
| 155 | 24 | 8 | 10 | 0 | 6 | 7 |

- `storia` al 69% — dominante
- `cosmo` assente: la Mesopotamia era la culla dell'astronomia (zodiaco, tabelle astronomiche, Enuma Anu Enlil)
- Presenza ragionevole in musica (arpe sumere) e filosofia

#### Antico Egitto (-3.100 / -30) — 361 eventi
| | storia | arte | musica | scienza | cosmo | filosofia | sport |
|-|--------|------|--------|---------|-------|-----------|-------|
| 240 | 39 | 19 | 25 | 0 | 22 | 8 |

- `storia` al 66%
- `cosmo` assente: l'astronomia egizia (allineamento piramidi, calendario solare) è una lacuna anomala
- Buona presenza di arte, scienza, filosofia

#### Grecia Classica (-500 / -323) — 70 eventi
| | storia | arte | musica | scienza | cosmo | filosofia | sport |
|-|--------|------|--------|---------|-------|-----------|-------|
| 37 | 15 | 4 | 6 | 0 | 8 | 0 |

- `sport` assente: le Olimpiadi classiche erano nel pieno svolgimento in questo periodo — **anomalia grave**
- `cosmo` assente: Anassagora, Eudosso, la cosmologia greca dovrebbe essere presente
- Buona filosofia (8 eventi)

#### Ellenismo (-323 / -31) — 71 eventi
| | storia | arte | musica | scienza | cosmo | filosofia | sport |
|-|--------|------|--------|---------|-------|-----------|-------|
| 51 | 2 | 5 | 8 | 0 | 4 | 1 |

- `arte` con solo 2 eventi è **anomalia grave**: il periodo ellenistico è uno dei più ricchi artisticamente (Nike di Samotracia, Laocoonte, scuola di Alessandria, Pergamo)
- `cosmo` assente
- `sport` con 1 evento: le Olimpiadi continuavano

#### Impero Romano (-27 / 476) — 103 eventi
| | storia | arte | musica | scienza | cosmo | filosofia | sport |
|-|--------|------|--------|---------|-------|-----------|-------|
| 79 | 8 | 2 | 2 | 0 | 10 | 1 |

- `storia` al 77% — fortemente sbilanciato
- `arte` con 8 eventi è anomala: l'arte romana (scultura, affresco, mosaico) è vastissima
- `musica` con 2 eventi: la musica romana e paleocristiana meriterebbe più spazio
- `scienza` con 2 eventi: ingegneria romana, medicina (Galeno) — sottorappresentata
- `sport` con 1 evento: i giochi del Circo Massimo, i gladiatori erano centrali nella cultura romana

---

### 3.4 Medioevo (sottoepoche)

#### Alto Medioevo (476 / 1000) — 117 eventi
| | storia | arte | musica | scienza | cosmo | filosofia | sport |
|-|--------|------|--------|---------|-------|-----------|-------|
| 84 | 5 | 11 | 4 | 0 | 12 | 1 |

- `arte` con 5 eventi è anomalo: arte bizantina, arte carolingia, miniatura medievale
- `cosmo` assente: l'astronomia araba del periodo (al-Khwarizmi, al-Battani) mancante
- `sport` con 1 evento: i tornei cavallereschi, la caccia come attività sportiva

#### Basso Medioevo (1000 / 1492) — 372 eventi
| | storia | arte | musica | scienza | cosmo | filosofia | sport |
|-|--------|------|--------|---------|-------|-----------|-------|
| 223 | 85 | 13 | 27 | 1 | 19 | 4 |

- Distribuzione migliore rispetto all'Alto Medioevo
- `musica` con 13 eventi è bassa considerando il canto gregoriano, la polifonia, i trovatori
- `cosmo` con 1 evento: l'astronomia medievale (Grossatesta, Ruggero Bacone) mancante
- `sport` con 4 eventi: tornei, arcieri, falconeria erano molto diffusi

#### Umanesimo (1350 / 1492) — 108 eventi
| | storia | arte | musica | scienza | cosmo | filosofia | sport |
|-|--------|------|--------|---------|-------|-----------|-------|
| 49 | 45 | 3 | 9 | 0 | 2 | 0 |

- `musica` con 3 eventi è anomalo per un periodo che vide l'Ars Nova e i polifonisti fiamminghi
- `filosofia` con 2 eventi è paradossale per l'Umanesimo per definizione filosofico (Pico della Mirandola, Lorenzo Valla, Ficino)
- `sport` assente
- `cosmo` assente: le osservazioni astronomiche quattrocentesche sono mancanti

---

### 3.5 Età Moderna (sottoepoche)

#### Rinascimento (1492 / 1600) — 211 eventi
| | storia | arte | musica | scienza | cosmo | filosofia | sport |
|-|--------|------|--------|---------|-------|-----------|-------|
| 87 | 66 | 11 | 16 | 0 | 31 | 0 |

- Buona copertura in arte (66) e filosofia (31)
- `cosmo` assente nonostante Copernico (1543) appartenga a questo periodo
- `sport` assente: calcio fiorentino, giostre, tornei

#### Riforma Protestante (1517 / 1648) — 244 eventi
| | storia | arte | musica | scienza | cosmo | filosofia | sport |
|-|--------|------|--------|---------|-------|-----------|-------|
| 102 | 57 | 15 | 44 | 0 | 26 | 0 |

- Ottima copertura scienza (44), inclusa la Rivoluzione Scientifica
- `cosmo` assente: paradossale dato che include Galileo e Keplero — probabile classificazione in `scienza`
- `sport` assente

#### Monarchie Assolute (1600 / 1789) — 386 eventi
| | storia | arte | musica | scienza | cosmo | filosofia | sport |
|-|--------|------|--------|---------|-------|-----------|-------|
| 165 | 72 | 28 | 99 | 2 | 16 | 2 |

- Ottima copertura scienza (99 = 26%) — il Seicento è il secolo della scienza
- `cosmo` con 2 eventi: la scoperta di Urano (1781) e un secondo — insufficiente per il periodo Newton/Cassini/Halley
- `sport` con 2 eventi: i giochi di corte, il golf scozzese, il cricket inglese nascevano in questo periodo

---

### 3.6 Età Contemporanea (sottoepoche)

#### Età delle Rivoluzioni (1789 / 1815) — 54 eventi
| | storia | arte | musica | scienza | cosmo | filosofia | sport |
|-|--------|------|--------|---------|-------|-----------|-------|
| 33 | 7 | 1 | 12 | 0 | 1 | 0 |

- `musica` con 1 evento: Beethoven iniziava la sua produzione in questo periodo — anomalo
- `filosofia` con 1 evento: Kant, Fichte, Hegel erano attivi — **lacuna grave**
- `cosmo` assente: Herschel, Laplace (nebulosa cosmologica) — periodo fertile per l'astronomia

#### I Guerra Mondiale (1914 / 1918) — 71 eventi
| | storia | arte | musica | scienza | cosmo | filosofia | sport |
|-|--------|------|--------|---------|-------|-----------|-------|
| 59 | 6 | 1 | 5 | 0 | 0 | 0 |

- `storia` all'83% — comprensibile ma eccessivo
- `musica` con 1 evento: la musica di guerra (Vera Lynn, canzoni patriottiche) è assente
- `filosofia` assente: il trauma della guerra generò riflessioni filosofiche fondamentali (Wittgenstein scrisse il Tractatus durante la guerra)
- `cosmo` assente: la conferma della relatività generale di Einstein avviene nel 1919

#### Tra le due guerre (1919 / 1939) — 320 eventi
| | storia | arte | musica | scienza | cosmo | filosofia | sport |
|-|--------|------|--------|---------|-------|-----------|-------|
| 162 | 78 | 21 | 52 | 1 | 0 | 6 |

- `filosofia` assente: **anomalia gravissima** — questo è il periodo del Circolo di Vienna, dell'esistenzialismo, di Heidegger, Russell, Wittgenstein, Croce, Dewey
- `cosmo` con 1 evento: Hubble scoprì l'espansione dell'universo in questo periodo
- Buona arte (78) e scienza (52)

#### II Guerra Mondiale (1939 / 1945) — 166 eventi
| | storia | arte | musica | scienza | cosmo | filosofia | sport |
|-|--------|------|--------|---------|-------|-----------|-------|
| 133 | 14 | 5 | 14 | 0 | 0 | 0 |

- `storia` all'80% — comprensibile
- `filosofia` assente: Camus, Sartre, Simone de Beauvoir erano attivi durante la guerra
- `sport` assente: lo sport fu sospeso ma non del tutto (campionati ridotti, propaganda sportiva)
- `cosmo` assente: ricerca bellica che portò al radar, ai razzi V2 (precursori della corsa spaziale)

#### Guerra Fredda (1947 / 1991) — 560 eventi
| | storia | arte | musica | scienza | cosmo | filosofia | sport |
|-|--------|------|--------|---------|-------|-----------|-------|
| 294 | 57 | 99 | 94 | 7 | 8 | 0 |

- Ottima musica (99) grazie ai precedenti script di arricchimento
- `cosmo` con 7 eventi: buono per la corsa spaziale ma potrebbe essere più ampio
- `sport` assente: **lacuna grave** — le Olimpiadi della Guerra Fredda (boicottaggi, Phelps, Bolt non erano ancora nati, ma Cassius Clay, Mark Spitz, Nadia Comaneci sì), il calcio mondiale, le Olimpiadi di Mosca e Los Angeles
- `filosofia` con 8 eventi: bassa per un periodo di grande produzione filosofica (strutturalismo, postmodernismo, ermeneutica)

#### Globalizzazione (1991 / 2001) — 141 eventi
| | storia | arte | musica | scienza | cosmo | filosofia | sport |
|-|--------|------|--------|---------|-------|-----------|-------|
| 72 | 11 | 17 | 37 | 1 | 0 | 3 |

- `arte` con 11 eventi: il boom dell'arte contemporanea degli anni '90 (Damien Hirst, Jeff Koons) è scarsamente rappresentato
- `filosofia` assente: il postmodernismo di Derrida, Foucault, Baudrillard stava raggiungendo il suo apice
- `cosmo` con 1 evento: il telescopio Hubble Space, la scoperta di pianeti exosolari

#### Era Digitale (2001 / 2025) — 328 eventi
| | storia | arte | musica | scienza | cosmo | filosofia | sport |
|-|--------|------|--------|---------|-------|-----------|-------|
| 143 | 27 | 49 | 96 | 8 | 3 | 0 |

- `arte` con 27 eventi (8,2%) è bassa per il primo quarto di secolo con esplosione di nuovi media
- `sport` assente: **gravissimo** — i Mondiali di calcio, le Olimpiadi moderne, i campioni sportivi del XXI secolo completamente assenti
- `filosofia` con 3 eventi: l'etica dell'AI, il transumanesimo, la filosofia del digitale quasi assenti

---

## 4. SQUILIBRI IDENTIFICATI (per gravità)

### 4.1 Squilibri strutturali di primo livello (gravissimi)

| # | Squilibrio | Entità | Periodo |
|---|-----------|--------|---------|
| 1 | **sport quasi assente** | Solo 27 eventi totali (0,7%) | Tutti i periodi storici, drammatico dal 1789 in poi |
| 2 | **filosofia crollata nell'epoca contemporanea** | 22 eventi su 2.199 (1%) dal 1789 | Contemporanea (lacuna vs. 133 in tutto il dataset) |
| 3 | **cosmo assente dalla narrativa storica** | 0 eventi in Età Antica, Medioevo, Rinascimento | Storia umana in genere |
| 4 | **Massicci duplicati per stesso slug** | David_(Donatello) x5, Colombo x4, Erodoto x3, Charlemagne x4 | Diffuso |
| 5 | **Iperconcentrazione su storia** | 52% del totale | Tutte le epoche |

### 4.2 Squilibri di secondo livello (gravi)

| # | Squilibrio | Dettaglio |
|---|-----------|-----------|
| 6 | **filosofia completamente assente in Tra le due guerre** | Il periodo più filosoficamente ricco del XX secolo (esistenzialismo, analitica, neopositivismo) ha 0 eventi |
| 7 | **sport assente nella Guerra Fredda** | Le Olimpiadi della Guerra Fredda, il calcio mondiale, la boxe, l'atletica completamente ignorate |
| 8 | **arte nell'Ellenismo gravemente bassa** | Solo 2 eventi per uno dei periodi artisticamente più ricchi dell'antichità |
| 9 | **musica nella Preistoria vicina a zero** | La nascita della musica (40.000 a.C.) è documentata ma marginale |
| 10 | **filosofia nell'Umanesimo paradossalmente bassa** | Solo 2 eventi nel periodo che prende nome dalla filosofia umanista |

### 4.3 Squilibri di terzo livello (rilevanti)

| # | Squilibrio | Dettaglio |
|---|-----------|-----------|
| 11 | **cosmo in Mesopotamia assente** | La Mesopotamia inventò l'astronomia — nessun evento `cosmo` |
| 12 | **arte nell'Impero Romano bassa** | 8 eventi per la Roma imperiale con mosaici, affreschi, scultura |
| 13 | **musica nell'Età delle Rivoluzioni quasi zero** | 1 evento per il periodo di Beethoven e del classicismo viennese |
| 14 | **sport nelle Olimpiadi classiche assente** | 0 eventi sport nella Grecia Classica, dove le Olimpiadi erano al culmine |
| 15 | **arte nell'Era Digitale bassa** | Solo 27 eventi per il 2001-2025, con l'esplosione di arte digitale, street art, NFT |

### 4.4 Problema tecnico: slug Wikipedia e duplicati

Durante l'analisi delle pagine a bassa popolarità, è emerso un pattern sistematico: molti eventi con slug Wikipedia **in inglese** restituiscono pochissimi byte (88-400 byte) sull'API italiana. Questo non indica pagine Wikipedia brevi, ma piuttosto:
- Reindirizzamenti o redirect brevi sul Wikipedia italiano
- Slug non trovati che tornano come stub
- La pagina italiana è molto più breve dell'originale inglese

Esempi sospetti: Herodotus=208 byte, Christopher_Columbus=357 byte, Aeschylus=88 byte — queste sono pagine vaste su Wikipedia in qualsiasi lingua.

**Conseguenza**: la metrica di popolarità basata sulla lunghezza della pagina Wikipedia italiana è parzialmente inaffidabile per slug in inglese. Gli slug andrebbero tradotti in italiano (es. `Erodoto` anziché `Herodotus`).

---

## 5. PIANO DI ARRICCHIMENTO PROPOSTO

### Per ogni lacuna grave, indicazione di quanti eventi aggiungere e di che tipo

#### PRIORITÀ A — Lacune strutturali (impatto massimo)

**A1. Sport nella Età Contemporanea** (Guerra Fredda + Era Digitale + Globalizzazione)
- Stimato gap: 80-100 eventi mancanti
- Tipo: persona (atleti), evento (olimpiadi, campionati), organizzazione (federazioni)
- Periodi target: 1896 (prima Olimpiade moderna), 1904-2020 (olimpiadi), 1930-2022 (mondiali calcio), pugilato (Ali, Tyson), atletica, tennis, ciclismo
- Suggerimento: 30 eventi persone (atleti iconici), 30 eventi (gare/campionati), 10 organizzazioni (IOC, FIFA)

**A2. Filosofia nel Novecento (1900-2025)**
- Stimato gap: 40-50 eventi mancanti
- Tipo: persona (filosofi), movimento (correnti filosofiche), opera (opere filosofiche)
- Periodi target: Tra le due guerre (Heidegger, Wittgenstein, Carnap, Russell), WWII (Sartre, Camus, de Beauvoir), Guerra Fredda (strutturalismo, postmodernismo), Era Digitale (filosofia dell'AI, bioetica)
- Suggerimento: 20 persone (filosofi), 15 movimenti (esistenzialismo, analitica, postmodernismo), 10 opere

**A3. cosmo nella storia umana (astronomia come disciplina)**
- Stimato gap: 30-40 eventi classificati come `cosmo`
- Tipo: scoperta, persona (astronomi), evento
- Periodi target: Mesopotamia (-3000), Egitto (-2500), Grecia (-400), Medioevo (astronomia islamica, 900-1200), Rinascimento (Copernico, Galileo), Età Moderna (Newton, Halley), Contemporanea (Hubble, NASA, telescopio James Webb)
- Nota: molti di questi potrebbero esistere già come `scienza` — reclassificare prima di aggiungere

#### PRIORITÀ B — Lacune significative

**B1. Arte nell'Ellenismo (-323/-31)**
- Gap stimato: 15-20 eventi
- Tipo: opera (sculture, architetture), persona (artisti), luogo (musei, siti)
- Target: Nike di Samotracia, Venere di Milo, Laocoonte, Pergamo, Biblioteca di Alessandria come centro artistico

**B2. Sport nell'Antichità (Olimpiadi classiche)**
- Gap stimato: 10-15 eventi
- Tipo: evento (gare olimpiche), persona (atleti), luogo (Olimpia, stadio)
- Target: Olimpiadi -776, -500, -400; atleti greci; giochi pitiici

**B3. Filosofia nell'Umanesimo (1350-1492)**
- Gap stimato: 8-12 eventi
- Tipo: persona (umanisti), opera (trattati), movimento (platonismo fiorentino)
- Target: Pico della Mirandola, Marsilio Ficino, Lorenzo Valla, Cusano, Accademia Platonica

**B4. Musica nell'Età delle Rivoluzioni (1789-1815)**
- Gap stimato: 8-10 eventi
- Tipo: persona (compositori), opera (sinfonie), evento (concerti)
- Target: Beethoven (Eroica 1803, 9a Sinfonia), Haydn, Mozart (fine vita), Schubert (primi lavori)

**B5. Arte nell'Era Digitale (2001-2025)**
- Gap stimato: 20-25 eventi
- Tipo: persona (artisti), opera (installazioni, film, videogiochi), movimento (arte digitale, street art)
- Target: Banksy, Ai Weiwei, arte degli NFT, cinema contemporaneo, architettura sostenibile

#### PRIORITÀ C — Duplicati da eliminare

Rimuovere o consolidare i duplicati più evidenti (stessa opera, stesso slug, titolo leggermente variante):
- `David_(Donatello)`: 5 voci → consolidare in 1-2
- `Christopher_Columbus`: 4 voci → consolidare in 1-2
- `Herodotus`: 3 voci → consolidare in 1
- `Charlemagne`: 4 voci → consolidare in 2
- `California_Gold_Rush`: 3 voci → consolidare in 1-2
- `Cuneiform`: 3 voci → consolidare in 1
- `Saladin`: 3 voci → consolidare in 1
- `Reign_of_Terror`: 3 voci → consolidare in 1
- `Peter_the_Great`: 3 voci → consolidare in 1-2

**Stima**: ~30-40 eventi ridondanti identificati

#### PRIORITÀ D — Reclassificazione suggerita

- Molti eventi `cosmo` storici sono classificati come `scienza`: valutare reclassificazione di eventi astronomici in `cosmo`
- Alcuni eventi `geologia` nella Preistoria sono in realtà `storia` (Göbekli Tepe classificato come `persona`, Monte Verde come `evento` in `geologia`)
- "I Fenici — l'Alfabeto e il Commercio nel Mediterraneo" classificato `sport` — evidente errore di classificazione (dovrebbe essere `storia`)
- "Bonifacio di Crediton" classificato `sport` nell'Alto Medioevo — dovrebbe essere `storia` o `filosofia`

---

## 6. SINTESI RACCOMANDAZIONI

Le raccomandazioni sono ordinate per impatto sul bilanciamento del dataset, dalla più urgente alla meno urgente.

| # | Azione | Tipo | Epoche coinvolte | Stima eventi |
|---|--------|------|------------------|-------------|
| **1** | **Aggiungere 80-100 eventi `sport`** nella Contemporanea (Olimpiadi moderne, calcio, atleti) | Aggiunta | 1896-2025 | +90 |
| **2** | **Aggiungere 40-50 eventi `filosofia`** nel Novecento (esistenzialismo, analitica, postmodernismo) | Aggiunta | 1900-2025 | +45 |
| **3** | **Correggere/eliminare ~35 duplicati** (stesso slug con titolo variante) | Rimozione/consolidamento | Diffuso | -35 |
| **4** | **Aggiungere 30-40 eventi `cosmo`** per coprire la storia dell'astronomia (Mesopotamia→NASA) | Aggiunta/Reclassificazione | -3000→2025 | +35 |
| **5** | **Correggere classificazioni errate** (es. Fenici come `sport`, Bonifacio come `sport`) | Reclassificazione | Vari | ~10 fix |
| **6** | **Arricchire arte nell'Ellenismo** (Venere di Milo, Nike, Pergamo, Laocoonte) | Aggiunta | -323/-31 | +15 |
| **7** | **Aggiungere `sport` nell'Antichità** (Olimpiadi greche, Giochi Istmici, Circo Massimo) | Aggiunta | -776/476 | +15 |
| **8** | **Arricchire `filosofia` nell'Umanesimo** (Ficino, Pico, Valla, Cusano) | Aggiunta | 1350/1492 | +10 |
| **9** | **Aggiungere `musica` nell'Età delle Rivoluzioni** (Beethoven, Haydn, Schubert) | Aggiunta | 1789/1815 | +8 |
| **10** | **Arricchire `arte` nell'Era Digitale** (street art, arte digitale, cinema, architettura) | Aggiunta | 2001/2025 | +20 |
| **11** | **Aggiungere `sport` nella Guerra Fredda** (atleti iconici, boicottaggi olimpici, calcio) | Aggiunta | 1947/1991 | +20 |
| **12** | **Ridurre la dominanza di `storia`** bilanciando le aggiunte verso discipline secondarie | Strategia | Tutte le epoche | - |
| **13** | **Tradurre i slug Wikipedia in italiano** per migliorare l'affidabilità del proxy di popolarità | Tecnico | Tutti | - |
| **14** | **Aggiungere `cosmo` in Mesopotamia ed Egitto** (astronomia babilonese, calendario egizio, zodiaco) | Aggiunta | -3500/-30 | +10 |
| **15** | **Aggiungere `filosofia` nell'Età delle Rivoluzioni** (Kant, Fichte, Hegel attivi 1789-1815) | Aggiunta | 1789/1815 | +8 |

### Impatto atteso delle raccomandazioni prioritarie (1-5)

Implementando le prime 5 raccomandazioni:
- `sport`: da 27 a ~120 eventi (da 0,7% a ~2,9%)
- `filosofia`: da 133 a ~178 eventi (da 3,4% a ~4,3%)
- Riduzione duplicati: da 3.968 a ~3.933 eventi netti con maggiore varietà
- `cosmo`: da 26 a ~60 eventi storicamente significativi
- Classificazioni corrette: ~10 eventi spostati nella categoria appropriata

Il dataset risultante sarebbe più bilanciato e rappresentativo dell'esperienza umana nella sua totalità, non solo della narrativa politica e militare.

---

*File di dati: `scripts/density-report.json`*
*Script di analisi: `scripts/analyze-density.cjs`*
*Fonte eventi: `src/data/events.json`*
