# Vital Articles Gap Analysis — Viaggiatore nel Tempo

> Generato il 2026-10-15 | Corpus: Wikipedia Vital Articles Level 4 (Metodo C)

---

## 1. Metodologia

**Metodo C** — Wikimedia Pageviews API (fallback)
- it.wikipedia 2023 (12 mesi) + en.wikipedia 2023 (12 mesi)
- 4835 slug it.wikipedia + 4674 slug en.wikipedia
- Aggregati per views totali annuali (proxy di rilevanza enciclopedica)
- Nota: corpus pageviews ha bias verso contenuti 2023; filtri aggressivi rimuovono contenuti non storici

### Pipeline di analisi:
1. **Dataset attuale**: `src/data/events.json` — 3032 entità, 2834 slug Wikipedia unici (incluse varianti senza parentesi)
2. **Corpus**: 9509 articoli originali (prima dei filtri)
3. **Filtri applicati**: pagine di navigazione (List of, Index of, Category:, Template:, Portal:), contenuti pop 2023 (serie TV, politici in carica, sport season 2023), anni 2020+ non storici — rimanenti: 9057
4. **Match diretto**: slug it.wikipedia confrontati direttamente con il dataset; slug en.wikipedia confrontati sia direttamente che via Wikidata
5. **Wikidata mapping**: batch da 50 titoli, API `wbgetentities?sites=enwiki` — 3912 slug EN mappati a IT
6. **Candidati finali**: 7612 entità non presenti nel dataset
7. **Prioritizzazione**: categorie lacunose (sport → cosmo → filosofia → musica → geologia) prima; poi per views annuali 2023

---

## 2. Statistiche

| Metrica | Valore |
|---------|--------|
| Corpus totale Vital Articles | 9509 |
| Dopo filtri (nav + pop) | 9057 |
| Già nel dataset (match diretto it) | 130 |
| Già nel dataset (match diretto en) | 155 |
| Mappati via Wikidata (en→it) | 3912 |
| **Candidati mancanti totali** | **7612** |
| Top 100 (questa analisi) | 100 |
| Top 20 priorità assolute | 21 |

### Distribuzione attuale del dataset:
| Categoria | Conteggio | % | Stato |
|-----------|-----------|---|-------|
| storia | 1430 | 47.2% | Sovrarappresentata |
| arte | 460 | 15.2% | OK |
| scienza | 399 | 13.2% | OK |
| musica | 295 | 9.7% | OK |
| geologia | 148 | 4.9% | OK |
| filosofia | 146 | 4.8% | ⚠️ Sottorappresentata |
| sport | 86 | 2.8% | ⚠️ LACUNA CRITICA |
| cosmo | 68 | 2.2% | ⚠️ LACUNA CRITICA |

---

## 3. Distribuzione candidati mancanti per categoria

| Categoria | Mancanti | Stato attuale dataset |
|-----------|----------|-----------------------|
| **sport** | **112** | ⚠️ LACUNA CRITICA |
| **cosmo** | **1** | ⚠️ LACUNA CRITICA |
| **filosofia** | **3** | ⚠️ Sottorappresentata |
| **musica** | **46** | OK |
| **geologia** | **8** | OK |
| **arte** | **337** | OK |
| **scienza** | **2** | OK |
| **storia** | **7103** | Sovrarappresentata |

---

## 4. Top 100 candidati mancanti

*Ordinati per: categoria lacunosa → popolarità (views 2023)*

| # | slug_en | Titolo IT | Anno | Categoria | Tipo | Views 2023 |
|---|---------|-----------|------|-----------|------|-----------|
| 1 | `Argentina_national_football_team` | Nazionale maschile di calcio dell'Argentina | — | sport | evento | 2.345.881 |
| 2 | `India–Pakistan_cricket_rivalry` | India–Pakistan cricket rivalry | — | sport | evento | 1.425.490 |
| 3 | `Women's_Premier_League_(cricket)` | Women's Premier League (cricket) | — | sport | organizzazione | 1.408.215 |
| 4 | `Ben_Shelton_(tennis)` | Ben Shelton (tennis) | — | sport | evento | 1.312.970 |
| 5 | `Texas_Rangers_(baseball)` | Texas Rangers (baseball) | — | sport | evento | 1.088.454 |
| 6 | `Nazionale_di_calcio_dell'Italia` | Nazionale di calcio dell'Italia | — | sport | evento | 888.151 |
| 7 | `India_national_football_team` | Nazionale maschile di calcio dell'India | — | sport | evento | 762.018 |
| 8 | `Manchester_City_Football_Club` | Manchester City Football Club | — | sport | organizzazione | 758.953 |
| 9 | `United_States_women's_national_soccer_team` | Nazionale femminile di calcio degli Stati Uniti d'America | — | sport | evento | 720.618 |
| 10 | `Unione_Calcio_Sampdoria` | Unione Calcio Sampdoria | — | sport | organizzazione | 682.831 |
| 11 | `Portugal_national_football_team` | Nazionale maschile di calcio del Portogallo | — | sport | evento | 640.143 |
| 12 | `Brazil_national_football_team` | Nazionale maschile di calcio del Brasile | — | sport | evento | 610.685 |
| 13 | `England_women's_national_football_team` | Nazionale femminile di calcio dell'Inghilterra | — | sport | evento | 570.131 |
| 14 | `Mary_Fowler_(soccer)` | Mary Fowler (soccer) | — | sport | evento | 557.113 |
| 15 | `England_cricket_team` | Nazionale maschile di cricket dell'Inghilterra | — | sport | evento | 549.550 |
| 16 | `Caleb_Martin_(basketball)` | Caleb Martin | — | sport | evento | 507.752 |
| 17 | `Paris_Saint-Germain_Football_Club` | Paris Saint-Germain Football Club | — | sport | organizzazione | 505.673 |
| 18 | `Genoa_Cricket_and_Football_Club` | Genoa Cricket and Football Club | — | sport | organizzazione | 496.971 |
| 19 | `Campionato_mondiale_di_calcio` | Campionato mondiale di calcio | — | sport | evento | 479.487 |
| 20 | `South_Africa_national_rugby_union_team` | Nazionale maschile di rugby a 15 del Sudafrica | — | sport | organizzazione | 450.067 |
| 21 | `Al-Nassr_Football_Club` | Al-Nassr Football Club | — | sport | organizzazione | 448.316 |
| 22 | `Associazione_Calcio_Monza` | Associazione Calcio Monza | — | sport | organizzazione | 447.398 |
| 23 | `Atalanta_Bergamasca_Calcio` | Atalanta Bergamasca Calcio | — | sport | evento | 443.153 |
| 24 | `Christian_Braun_(basketball)` | Christian Braun (basketball) | — | sport | evento | 434.838 |
| 25 | `Australia_women's_national_soccer_team` | Nazionale femminile di calcio dell'Australia | — | sport | evento | 416.151 |
| 26 | `Spain_women's_national_football_team` | Nazionale femminile di calcio della Spagna | — | sport | evento | 411.248 |
| 27 | `Campionato_mondiale_di_calcio_femminile_2023` | Campionato mondiale di calcio femminile 2023 | — | sport | evento | 407.422 |
| 28 | `Coppa_del_Mondo_di_rugby_2023` | Coppa del Mondo di rugby 2023 | — | sport | evento | 407.192 |
| 29 | `Manchester_United_Football_Club` | Manchester United Football Club | — | sport | organizzazione | 398.468 |
| 30 | `Chelsea_Football_Club` | Chelsea Football Club | — | sport | organizzazione | 387.348 |
| 31 | `England_national_football_team` | Nazionale maschile di calcio dell'Inghilterra | — | sport | evento | 366.750 |
| 32 | `Sophia_Smith_(soccer,_born_2000)` | Sophia Smith (soccer, born 2000) | — | sport | persona | 364.338 |
| 33 | `Michael_Malone_(basketball)` | Michael Malone (basketball) | — | sport | evento | 362.167 |
| 34 | `Argentina–Brazil_football_rivalry` | Rivalità calcistica Argentina-Brasile | — | sport | evento | 338.707 |
| 35 | `International_Cricket_Council` | International Cricket Council | — | sport | evento | 337.037 |
| 36 | `Kepler's_Supernova` | SN 1604 | — | cosmo | evento | 5.715.801 |
| 37 | `History_of_the_Jews_and_Judaism_in_the_Land_of_Israel` | History of the Jews and Judaism in the Land of Israel | — | filosofia | evento | 499.837 |
| 38 | `Islam` | Islam | — | filosofia | evento | 40.085 |
| 39 | `Ebraismo` | Ebraismo | — | filosofia | evento | 39.545 |
| 40 | `Annalisa_(cantante)` | Annalisa (cantante) | — | musica | evento | 1.150.433 |
| 41 | `Mango_(cantante)` | Mango (cantante) | — | musica | evento | 1.126.749 |
| 42 | `Madame_(cantante)` | Madame (cantante) | — | musica | evento | 670.410 |
| 43 | `Mina_(cantante)` | Mina (cantante) | — | musica | evento | 585.497 |
| 44 | `Giorgia_(cantante_1971)` | Giorgia (cantante 1971) | — | musica | evento | 485.590 |
| 45 | `Elodie_(cantante)` | Elodie (cantante) | — | musica | evento | 474.588 |
| 46 | `The_Sound_of_Music_(film)` | Tutti insieme appassionatamente | — | musica | opera | 388.591 |
| 47 | `Kid_Rock` | Kid Rock | — | musica | evento | 381.176 |
| 48 | `Madonna_(cantante)` | Madonna (cantante) | — | musica | evento | 341.596 |
| 49 | `Ariete_(cantante)` | Ariete (cantante) | — | musica | evento | 335.591 |
| 50 | `Morgan_(cantante)` | Morgan (cantante) | — | musica | evento | 234.619 |
| 51 | `Blanco_(cantante)` | Blanco (cantante) | — | musica | evento | 201.875 |
| 52 | `Fiordaliso_(cantante)` | Fiordaliso (cantante) | — | musica | evento | 196.372 |
| 53 | `Elisa_(cantante_1977)` | Elisa (cantante 1977) | — | musica | evento | 194.045 |
| 54 | `Levante_(cantante)` | Levante (cantante) | — | musica | evento | 167.735 |
| 55 | `Gianmaria_(cantante)` | Gianmaria (cantante) | — | musica | evento | 165.185 |
| 56 | `LDA_(cantante)` | LDA (cantante) | — | musica | evento | 148.204 |
| 57 | `Achille_Lauro_(cantante)` | Achille Lauro (cantante) | — | musica | evento | 133.633 |
| 58 | `Shari_(cantante)` | Shari (cantante) | — | musica | evento | 124.673 |
| 59 | `Colapesce_(cantante)` | Colapesce (cantante) | — | musica | evento | 112.104 |
| 60 | `Terremoto_in_Turchia_e_Siria_del_2023` | Terremoto in Turchia e Siria del 2023 | — | geologia | evento | 137.570 |
| 61 | `Terremoto_dell'Irpinia_del_1980` | Terremoto dell'Irpinia del 1980 | — | geologia | evento | 87.806 |
| 62 | `Terremoto_dell'Aquila_del_2009` | Terremoto dell'Aquila del 2009 | — | geologia | evento | 75.672 |
| 63 | `Terremoto_di_Valdivia_del_1960` | Terremoto di Valdivia del 1960 | — | geologia | evento | 73.447 |
| 64 | `Terremoto_e_maremoto_dell'Oceano_Indiano_del_2004` | Terremoto e maremoto dell'Oceano Indiano del 2004 | — | geologia | evento | 48.536 |
| 65 | `Terremoto_di_Messina_del_1908` | Terremoto di Messina del 1908 | — | geologia | evento | 47.103 |
| 66 | `Terremoto` | Terremoto | — | geologia | evento | 40.921 |
| 67 | `Terremoto_e_maremoto_del_Tōhoku_del_2011` | Terremoto e maremoto del Tōhoku del 2011 | — | geologia | evento | 34.593 |
| 68 | `Animal_(2023_film)` | Animal (2023 film) | — | arte | opera | 16.456.643 |
| 69 | `Leo_(2023_Indian_film)` | Leo (film 2023 Kanagaraj) | — | arte | opera | 13.038.772 |
| 70 | `Killers_of_the_Flower_Moon_(film)` | Killers of the Flower Moon (film) | — | arte | opera | 11.334.481 |
| 71 | `Sound_of_Freedom_(film)` | Sound of Freedom - Il canto della libertà | — | arte | opera | 7.632.861 |
| 72 | `Dunki_(film)` | Dunki (film) | — | arte | opera | 6.734.065 |
| 73 | `Mission:_Impossible_(film_series)` | Mission: Impossible (serie di film) | — | arte | opera | 5.884.436 |
| 74 | `X_(2022_film)` | X: A Sexy Horror Story | — | arte | opera | 5.755.384 |
| 75 | `Jailer_(film)` | Jailer (film) | — | arte | opera | 5.051.660 |
| 76 | `RRR_(film)` | RRR (film) | — | arte | opera | 4.354.997 |
| 77 | `Jailer_(2023_Tamil_film)` | Jailer | — | arte | opera | 4.205.459 |
| 78 | `Air_(2023_film)` | Air (2023 film) | — | arte | opera | 3.375.483 |
| 79 | `The_Iron_Claw_(film)` | The Warrior: The Iron Claw | — | arte | opera | 2.221.320 |
| 80 | `Sisu_(film)` | Sisu - L'immortale | — | arte | opera | 2.193.443 |
| 81 | `Ghosted_(2023_film)` | Ghosted (film) | — | arte | opera | 2.144.827 |
| 82 | `Dasara_(film)` | Dasara (film) | — | arte | opera | 2.126.912 |
| 83 | `Lessons_in_Chemistry` | Lessons in Chemistry | — | scienza | evento | 874.464 |
| 84 | `Nuclear_weapon` | Arma nucleare | — | scienza | evento | 382.764 |
| 85 | `Ansel_Adams` | Ansel Adams | — | storia | evento | 16.611.726 |
| 86 | `Alia_Bhatt` | Alia Bhatt | — | storia | evento | 12.669.342 |
| 87 | `Travis_Kelce` | Travis Kelce | — | storia | evento | 11.200.097 |
| 88 | `Virat_Kohli` | Virat Kohli | — | storia | evento | 10.778.056 |
| 89 | `Vivek_Ramaswamy` | Vivek Ramaswamy | — | storia | evento | 10.335.313 |
| 90 | `Gadar_2` | Gadar 2 | — | storia | evento | 9.799.519 |
| 91 | `Al_Nassr_FC` | Al Nassr FC | — | storia | evento | 9.786.600 |
| 92 | `Robert_F._Kennedy_Jr.` | Robert F. Kennedy Jr. | — | storia | evento | 9.185.718 |
| 93 | `.xxx` | .xxx | — | storia | evento | 9.078.696 |
| 94 | `Mission:_Impossible_–_Dead_Reckoning_Part_One` | Mission: Impossible - Dead Reckoning | — | storia | evento | 9.011.204 |
| 95 | `Tommy_Paul_(tennis)` | Tommy Paul | — | sport | evento | 324.542 |
| 96 | `Cam_Thomas_(basketball)` | Cam Thomas (basketball) | — | sport | evento | 322.562 |
| 97 | `UConn_Huskies_men's_basketball` | UConn Huskies men's basketball | — | sport | evento | 302.608 |
| 98 | `World_Chess_Championship` | Campionato del mondo di scacchi | — | sport | evento | 301.593 |
| 99 | `Colorado_Buffaloes_football` | Colorado Buffaloes football | — | sport | evento | 300.139 |
| 100 | `Campionato_mondiale_di_calcio_2022` | Campionato mondiale di calcio 2022 | — | sport | evento | 296.928 |

---

## 5. Top 20 priorità assolute

Criteri: (1) colma lacune categorie sottorappresentate (sport, cosmo, filosofia, musica, geologia), (2) massima popolarità Wikipedia

| # | slug_en | Titolo IT | Anno | Categoria | Tipo | Motivazione |
|---|---------|-----------|------|-----------|------|-------------|
| 1 | `Argentina_national_football_team` | Nazionale maschile di calcio dell'Argentina | — | **sport** | evento | Categoria **sport** sottorappresentata nel dataset — 2.345.881 views/anno 2023 |
| 2 | `India–Pakistan_cricket_rivalry` | India–Pakistan cricket rivalry | — | **sport** | evento | Categoria **sport** sottorappresentata nel dataset — 1.425.490 views/anno 2023 |
| 3 | `Women's_Premier_League_(cricket)` | Women's Premier League (cricket) | — | **sport** | organizzazione | Categoria **sport** sottorappresentata nel dataset — 1.408.215 views/anno 2023 |
| 4 | `Ben_Shelton_(tennis)` | Ben Shelton (tennis) | — | **sport** | evento | Categoria **sport** sottorappresentata nel dataset — 1.312.970 views/anno 2023 |
| 5 | `Texas_Rangers_(baseball)` | Texas Rangers (baseball) | — | **sport** | evento | Categoria **sport** sottorappresentata nel dataset — 1.088.454 views/anno 2023 |
| 6 | `Nazionale_di_calcio_dell'Italia` | Nazionale di calcio dell'Italia | — | **sport** | evento | Categoria **sport** sottorappresentata nel dataset — 888.151 views/anno 2023 |
| 7 | `India_national_football_team` | Nazionale maschile di calcio dell'India | — | **sport** | evento | Categoria **sport** sottorappresentata nel dataset — 762.018 views/anno 2023 |
| 8 | `Manchester_City_Football_Club` | Manchester City Football Club | — | **sport** | organizzazione | Categoria **sport** sottorappresentata nel dataset — 758.953 views/anno 2023 |
| 9 | `Annalisa_(cantante)` | Annalisa (cantante) | — | **musica** | evento | Categoria **musica** sottorappresentata nel dataset — 1.150.433 views/anno 2023 |
| 10 | `Mango_(cantante)` | Mango (cantante) | — | **musica** | evento | Categoria **musica** sottorappresentata nel dataset — 1.126.749 views/anno 2023 |
| 11 | `Madame_(cantante)` | Madame (cantante) | — | **musica** | evento | Categoria **musica** sottorappresentata nel dataset — 670.410 views/anno 2023 |
| 12 | `Mina_(cantante)` | Mina (cantante) | — | **musica** | evento | Categoria **musica** sottorappresentata nel dataset — 585.497 views/anno 2023 |
| 13 | `Giorgia_(cantante_1971)` | Giorgia (cantante 1971) | — | **musica** | evento | Categoria **musica** sottorappresentata nel dataset — 485.590 views/anno 2023 |
| 14 | `Elodie_(cantante)` | Elodie (cantante) | — | **musica** | evento | Categoria **musica** sottorappresentata nel dataset — 474.588 views/anno 2023 |
| 15 | `Kepler's_Supernova` | SN 1604 | — | **cosmo** | evento | Categoria **cosmo** sottorappresentata nel dataset — 5.715.801 views/anno 2023 |
| 16 | `History_of_the_Jews_and_Judaism_in_the_Land_of_Israel` | History of the Jews and Judaism in the Land of Israel | — | **filosofia** | evento | Categoria **filosofia** sottorappresentata nel dataset — 499.837 views/anno 2023 |
| 17 | `Islam` | Islam | — | **filosofia** | evento | Categoria **filosofia** sottorappresentata nel dataset — 40.085 views/anno 2023 |
| 18 | `Ebraismo` | Ebraismo | — | **filosofia** | evento | Categoria **filosofia** sottorappresentata nel dataset — 39.545 views/anno 2023 |
| 19 | `Terremoto_in_Turchia_e_Siria_del_2023` | Terremoto in Turchia e Siria del 2023 | — | **geologia** | evento | Categoria **geologia** sottorappresentata nel dataset — 137.570 views/anno 2023 |
| 20 | `Terremoto_dell'Irpinia_del_1980` | Terremoto dell'Irpinia del 1980 | — | **geologia** | evento | Categoria **geologia** sottorappresentata nel dataset — 87.806 views/anno 2023 |
| 21 | `Terremoto_dell'Aquila_del_2009` | Terremoto dell'Aquila del 2009 | — | **geologia** | evento | Categoria **geologia** sottorappresentata nel dataset — 75.672 views/anno 2023 |

---

## 6. Dettaglio per categorie lacunose

### Sport (112 candidati mancanti)

| slug_en | Titolo IT | Anno | Tipo | Views 2023 |
|---------|-----------|------|------|--------|
| `Argentina_national_football_team` | Nazionale maschile di calcio dell'Argentina | — | evento | 2.345.881 |
| `India–Pakistan_cricket_rivalry` | India–Pakistan cricket rivalry | — | evento | 1.425.490 |
| `Women's_Premier_League_(cricket)` | Women's Premier League (cricket) | — | organizzazione | 1.408.215 |
| `Ben_Shelton_(tennis)` | Ben Shelton (tennis) | — | evento | 1.312.970 |
| `Texas_Rangers_(baseball)` | Texas Rangers (baseball) | — | evento | 1.088.454 |
| `Nazionale_di_calcio_dell'Italia` | Nazionale di calcio dell'Italia | — | evento | 888.151 |
| `India_national_football_team` | Nazionale maschile di calcio dell'India | — | evento | 762.018 |
| `Manchester_City_Football_Club` | Manchester City Football Club | — | organizzazione | 758.953 |
| `United_States_women's_national_soccer_team` | Nazionale femminile di calcio degli Stati Uniti d'America | — | evento | 720.618 |
| `Unione_Calcio_Sampdoria` | Unione Calcio Sampdoria | — | organizzazione | 682.831 |
| `Portugal_national_football_team` | Nazionale maschile di calcio del Portogallo | — | evento | 640.143 |
| `Brazil_national_football_team` | Nazionale maschile di calcio del Brasile | — | evento | 610.685 |
| `England_women's_national_football_team` | Nazionale femminile di calcio dell'Inghilterra | — | evento | 570.131 |
| `Mary_Fowler_(soccer)` | Mary Fowler (soccer) | — | evento | 557.113 |
| `England_cricket_team` | Nazionale maschile di cricket dell'Inghilterra | — | evento | 549.550 |
| `Caleb_Martin_(basketball)` | Caleb Martin | — | evento | 507.752 |
| `Paris_Saint-Germain_Football_Club` | Paris Saint-Germain Football Club | — | organizzazione | 505.673 |
| `Genoa_Cricket_and_Football_Club` | Genoa Cricket and Football Club | — | organizzazione | 496.971 |
| `Campionato_mondiale_di_calcio` | Campionato mondiale di calcio | — | evento | 479.487 |
| `South_Africa_national_rugby_union_team` | Nazionale maschile di rugby a 15 del Sudafrica | — | organizzazione | 450.067 |

*... e altri 92 candidati*

### Cosmo (1 candidati mancanti)

| slug_en | Titolo IT | Anno | Tipo | Views 2023 |
|---------|-----------|------|------|--------|
| `Kepler's_Supernova` | SN 1604 | — | evento | 5.715.801 |

### Filosofia (3 candidati mancanti)

| slug_en | Titolo IT | Anno | Tipo | Views 2023 |
|---------|-----------|------|------|--------|
| `History_of_the_Jews_and_Judaism_in_the_Land_of_Israel` | History of the Jews and Judaism in the Land of Israel | — | evento | 499.837 |
| `Islam` | Islam | — | evento | 40.085 |
| `Ebraismo` | Ebraismo | — | evento | 39.545 |

### Musica (46 candidati mancanti)

| slug_en | Titolo IT | Anno | Tipo | Views 2023 |
|---------|-----------|------|------|--------|
| `Annalisa_(cantante)` | Annalisa (cantante) | — | evento | 1.150.433 |
| `Mango_(cantante)` | Mango (cantante) | — | evento | 1.126.749 |
| `Madame_(cantante)` | Madame (cantante) | — | evento | 670.410 |
| `Mina_(cantante)` | Mina (cantante) | — | evento | 585.497 |
| `Giorgia_(cantante_1971)` | Giorgia (cantante 1971) | — | evento | 485.590 |
| `Elodie_(cantante)` | Elodie (cantante) | — | evento | 474.588 |
| `The_Sound_of_Music_(film)` | Tutti insieme appassionatamente | — | opera | 388.591 |
| `Kid_Rock` | Kid Rock | — | evento | 381.176 |
| `Madonna_(cantante)` | Madonna (cantante) | — | evento | 341.596 |
| `Ariete_(cantante)` | Ariete (cantante) | — | evento | 335.591 |
| `Morgan_(cantante)` | Morgan (cantante) | — | evento | 234.619 |
| `Blanco_(cantante)` | Blanco (cantante) | — | evento | 201.875 |
| `Fiordaliso_(cantante)` | Fiordaliso (cantante) | — | evento | 196.372 |
| `Elisa_(cantante_1977)` | Elisa (cantante 1977) | — | evento | 194.045 |
| `Levante_(cantante)` | Levante (cantante) | — | evento | 167.735 |
| `Gianmaria_(cantante)` | Gianmaria (cantante) | — | evento | 165.185 |
| `LDA_(cantante)` | LDA (cantante) | — | evento | 148.204 |
| `Achille_Lauro_(cantante)` | Achille Lauro (cantante) | — | evento | 133.633 |
| `Shari_(cantante)` | Shari (cantante) | — | evento | 124.673 |
| `Colapesce_(cantante)` | Colapesce (cantante) | — | evento | 112.104 |

*... e altri 26 candidati*

### Geologia (8 candidati mancanti)

| slug_en | Titolo IT | Anno | Tipo | Views 2023 |
|---------|-----------|------|------|--------|
| `Terremoto_in_Turchia_e_Siria_del_2023` | Terremoto in Turchia e Siria del 2023 | — | evento | 137.570 |
| `Terremoto_dell'Irpinia_del_1980` | Terremoto dell'Irpinia del 1980 | — | evento | 87.806 |
| `Terremoto_dell'Aquila_del_2009` | Terremoto dell'Aquila del 2009 | — | evento | 75.672 |
| `Terremoto_di_Valdivia_del_1960` | Terremoto di Valdivia del 1960 | — | evento | 73.447 |
| `Terremoto_e_maremoto_dell'Oceano_Indiano_del_2004` | Terremoto e maremoto dell'Oceano Indiano del 2004 | — | evento | 48.536 |
| `Terremoto_di_Messina_del_1908` | Terremoto di Messina del 1908 | — | evento | 47.103 |
| `Terremoto` | Terremoto | — | evento | 40.921 |
| `Terremoto_e_maremoto_del_Tōhoku_del_2011` | Terremoto e maremoto del Tōhoku del 2011 | — | evento | 34.593 |

---

## 7. Note metodologiche e limitazioni

- **Metodo C**: fallback pageviews — differisce dalla curated list Vital Articles. I Vital Articles Level 4 sono inaccessibili via Category API (la categoria è vuota) e via subpage links (le sottopagine usano template speciali non riconosciuti da prop=links). Il corpus pageviews 2023 è un proxy ragionevole ma ha bias verso contenuti contemporanei.
- **Classificazione automatica**: categoria e tipo sono stimati euristicamente dal titolo; richiedono validazione manuale prima dell'inserimento.
- **Anno stimato**: estratto da regex `\b[0-9]{3,4}\b` nel titolo; spesso assente per persone/eventi.
- **Falsi negativi**: entità storiche rilevanti con titoli non contenenti parole-chiave riconoscibili potrebbero non essere classificate correttamente.
- **Falsi positivi**: nonostante i filtri, alcuni candidati potrebbero essere troppo contemporanei o irrilevanti per la mappa storica.
- **Wikidata mapping**: funzionante solo per slug EN non coincidenti con IT; 3912 slug mappati su 4124 candidati EN.

---

## 8. Suggerimenti per l'integrazione

Per aggiungere un candidato al dataset:
1. Verifica manualmente che l'entità sia appropriata per una mappa storica (ha coordinate o è localizzabile?)
2. Controlla il titolo italiano su it.wikipedia
3. Usa `scripts/add-events-*.cjs` come template per il formato JSON
4. Aggiorna la distribuzione categorie: obiettivo → sport ≥ 5%, cosmo ≥ 3%, filosofia ≥ 6%

---

*Report generato da `scripts/vital-articles-analysis.cjs` — Viaggiatore nel Tempo*
