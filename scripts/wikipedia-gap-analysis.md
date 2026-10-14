# Analisi delle Lacune — Viaggiatore nel Tempo vs Wikipedia

> Generato il 2026-10-14 | Fonte: Wikimedia Pageviews API 2024 (gen–apr)

---

## 1. Metodologia

1. **Dataset attuale**: `src/data/events.json` — 2976 entità, circa 2412 slug Wikipedia unici.
2. **Fonte Wikipedia**: API Wikimedia Pageviews — top 1000 articoli per mese su Wikipedia italiana, mesi gennaio–aprile 2024 (2322 slug unici totali analizzati).
3. **Aggregazione**: media delle viste mensili su tutti i mesi disponibili.
4. **Filtri applicati**:
   - Escluse pagine di navigazione/portali Wikipedia
   - Esclusi politici in carica 2024 (Meloni, Biden, Putin, ecc.)
   - Esclusi cantanti pop contemporanei attivi (Ghali, Geolier, Annalisa, ecc.)
   - Escluse serie TV e film recenti (Fallout, Baby Reindeer, ecc.)
   - Esclusi eventi sportivi 2024 (Euro 2024, Australian Open 2024, ecc.)
   - Esclusi personaggi di cronaca 2024 (Chico Forti, Jeffrey Epstein, ecc.)
   - Escluse giornate commemorative generiche
   - Incluse solo entità storicamente rilevanti: persone morte prima del ~2010, eventi storici, luoghi, movimenti, organizzazioni storiche
5. **Soglia di rilevanza**: ≥ 50.000 viste/mese medie.
6. **Entità conosciute**: lista manuale di 25+ entità storiche prioritarie con classificazione corretta.

---

## 2. Distribuzione attuale del dataset

| Categoria | Conteggio | % | Stato |
|-----------|-----------|---|-------|
| storia | 1.421 | 47.8% | Sovrarappresentata |
| arte | 454 | 15.3% | OK |
| scienza | 399 | 13.4% | OK |
| musica | 294 | 9.9% | OK |
| geologia | 148 | 5.0% | OK |
| filosofia | 131 | 4.4% | ⚠️ Sottorappresentata |
| sport | 76 | 2.6% | ⚠️ Lacuna critica |
| cosmo | 53 | 1.8% | ⚠️ Lacuna critica |

| Tipo | Conteggio | % | Stato |
|------|-----------|---|-------|
| persona | 1.206 | 40.5% | Dominante |
| evento | 567 | 19.1% | OK |
| opera | 542 | 18.2% | OK |
| scoperta | 416 | 14.0% | OK |
| movimento | 164 | 5.5% | OK |
| luogo | 54 | 1.8% | ⚠️ Sottorappresentato |
| organizzazione | 27 | 0.9% | ⚠️ Lacuna critica |

---

## 3. Top candidati HIGH priority (>200.000 viste/mese)

| Slug | Titolo IT | Anno | Categoria | Tipo | Views/mese | Bilanciamento |
|------|-----------|------|-----------|------|------------|---------------|
| Gigi_Riva | Gigi Riva | 1944 | sport | persona | 1.093.718 | ✓ Lacuna |
| Goffredo_Mameli | Goffredo Mameli | 1827 | storia | persona | 496.777 |  |
| Società_Sportiva_Calcio_Napoli | Società Sportiva Calcio Napoli | 1926 | sport | organizzazione | 458.347 | ✓ Lacuna |
| Strage_di_Acca_Larenzia | Strage di Acca Larenzia | 1978 | storia | evento | 402.460 |  |
| La_Storia_(romanzo) | La Storia (romanzo) | 1974 | arte | opera | 373.195 |  |
| Anniversario_della_liberazione_d'Italia | Anniversario della liberazione d'Italia | 1945 | storia | evento | 370.377 |  |
| John_Travolta | John Travolta | 1954 | arte | persona | 356.437 |  |
| Akira_Toriyama | Akira Toriyama | 1955 | arte | persona | 352.679 |  |
| Dino_Grandi | Dino Grandi | 1895 | storia | persona | 322.586 |  |
| Franz_Beckenbauer | Franz Beckenbauer | 1945 | sport | persona | 274.457 | ✓ Lacuna |
| Disastro_aereo_delle_Ande | Disastro aereo delle Ande | 1972 | storia | evento | 241.060 |  |

*(11 candidati HIGH totali)*

---

## 4. Top 30 candidati MEDIUM priority (100.000–200.000 viste/mese)

| Slug | Titolo IT | Anno | Categoria | Tipo | Views/mese | Bilanciamento |
|------|-----------|------|-----------|------|------------|---------------|
| Massacri_delle_foibe | Massacri delle foibe | 1945 | storia | evento | 198.113 |  |
| Riccardo_Cocciante | Riccardo Cocciante | 1946 | musica | persona | 196.628 |  |
| Vittorio_Emanuele_di_Savoia_(1937) | Vittorio Emanuele di Savoia (1937) | 1937 | storia | persona | 195.996 |  |
| Juventus_Football_Club | Juventus Football Club | 1897 | sport | organizzazione | 193.016 | ✓ Lacuna |
| Carla_Bruni | Carla Bruni | 1967 | arte | persona | 181.345 |  |
| Griselda_Blanco | Griselda Blanco | 1943 | storia | persona | 177.232 |  |
| Football_Club_Internazionale_Milano | Football Club Internazionale Milano | 1908 | sport | organizzazione | 176.908 | ✓ Lacuna |
| Roberto_Cavalli | Roberto Cavalli | 1940 | arte | persona | 171.323 |  |
| Alda_Merini | Alda Merini | 1931 | arte | persona | 171.120 |  |
| Andreas_Brehme | Andreas Brehme | 1960 | sport | persona | 158.614 | ✓ Lacuna |
| Associazione_Calcio_Milan | Associazione Calcio Milan | 1899 | sport | organizzazione | 128.812 | ✓ Lacuna |
| Carlos_Alcaraz_(calciatore) | Carlos Alcaraz (calciatore) | — | sport | persona | 117.930 | ✓ Lacuna |
| Strage_di_Erba | Strage di Erba | — | storia | evento | 116.951 |  |
| Associazione_Sportiva_Roma | Associazione Sportiva Roma | 1927 | sport | organizzazione | 108.730 | ✓ Lacuna |
| Grande_Slam_(tennis) | Grande Slam (tennis) | 1924 | sport | evento | 100.626 | ✓ Lacuna |

*(15 candidati MEDIUM totali)*

---

## 5. Analisi per disciplina

### Storia
- Peso attuale nel dataset: **47.8%** (1421 entità)
- Candidati HIGH trovati: **5**
- Candidati MEDIUM trovati: **4**
- Top candidati HIGH: *Goffredo Mameli* (496.777 viste/mese), *Strage di Acca Larenzia* (402.460 viste/mese), *Anniversario della liberazione d'Italia* (370.377 viste/mese)
- Impatto aggiunta nuove entità: Neutro — categoria già ben rappresentata; aggiungere solo entità molto rilevanti

### Arte
- Peso attuale nel dataset: **15.3%** (454 entità)
- Candidati HIGH trovati: **3**
- Candidati MEDIUM trovati: **3**
- Top candidati HIGH: *La Storia (romanzo)* (373.195 viste/mese), *John Travolta* (356.437 viste/mese), *Akira Toriyama* (352.679 viste/mese)
- Impatto aggiunta nuove entità: Neutro — categoria già ben rappresentata; aggiungere solo entità molto rilevanti

### Scienza
- Peso attuale nel dataset: **13.4%** (399 entità)
- Candidati HIGH trovati: **0**
- Candidati MEDIUM trovati: **0**
- Nessun candidato HIGH identificato
- Impatto aggiunta nuove entità: Neutro — categoria già ben rappresentata; aggiungere solo entità molto rilevanti

### Musica ⚠️ SOTTORAPPRESENTATA
- Peso attuale nel dataset: **9.9%** (294 entità)
- Candidati HIGH trovati: **0**
- Candidati MEDIUM trovati: **1**
- Nessun candidato HIGH identificato
- Impatto aggiunta nuove entità: **Moderato** — categoria presente ma non dominante

### Geologia ⚠️ SOTTORAPPRESENTATA
- Peso attuale nel dataset: **5%** (148 entità)
- Candidati HIGH trovati: **0**
- Candidati MEDIUM trovati: **0**
- Nessun candidato HIGH identificato
- Impatto aggiunta nuove entità: **Moderato** — categoria presente ma non dominante

### Filosofia ⚠️ LACUNA CRITICA
- Peso attuale nel dataset: **4.4%** (131 entità)
- Candidati HIGH trovati: **0**
- Candidati MEDIUM trovati: **0**
- Nessun candidato HIGH identificato
- Impatto aggiunta nuove entità: **ALTO** — ogni aggiunta riduce significativamente la sottorappresentazione

### Sport ⚠️ LACUNA CRITICA
- Peso attuale nel dataset: **2.6%** (76 entità)
- Candidati HIGH trovati: **3**
- Candidati MEDIUM trovati: **7**
- Top candidati HIGH: *Gigi Riva* (1.093.718 viste/mese), *Società Sportiva Calcio Napoli* (458.347 viste/mese), *Franz Beckenbauer* (274.457 viste/mese)
- Impatto aggiunta nuove entità: **ALTO** — ogni aggiunta riduce significativamente la sottorappresentazione

### Cosmo ⚠️ LACUNA CRITICA
- Peso attuale nel dataset: **1.8%** (53 entità)
- Candidati HIGH trovati: **0**
- Candidati MEDIUM trovati: **0**
- Nessun candidato HIGH identificato
- Impatto aggiunta nuove entità: **ALTO** — ogni aggiunta riduce significativamente la sottorappresentazione


---

## 6. Raccomandazione finale — Top 20 entità assolutamente da aggiungere

**Criterio**: priorità a:
1. Entità che colmano lacune di categorie/tipi sottorappresentati (sport, cosmo, filosofia; luogo, organizzazione)
2. Massima popolarità su Wikipedia italiana (= massimo interesse degli utenti)
3. Inequivocabile rilevanza storica

| # | Slug | Titolo | Anno | Cat | Tipo | Views/mese | Motivazione |
|---|------|--------|------|-----|------|------------|-------------|
| 1 | `Gigi_Riva` | Gigi Riva | 1944 | **sport** | persona | 1.093.718 | Leggenda del calcio italiano, miglior marcatore azzurro di sempre, morto 2024. 1.093.718 viste/mese su Wikipedia italiana 2024. |
| 2 | `Società_Sportiva_Calcio_Napoli` | Società Sportiva Calcio Napoli | 1926 | **sport** | organizzazione | 458.347 | Squadra di calcio con tre scudetti, molto popolare in Italia. 458.347 viste/mese su Wikipedia italiana 2024. |
| 3 | `Franz_Beckenbauer` | Franz Beckenbauer | 1945 | **sport** | persona | 274.457 | Il Kaiser, leggenda del calcio tedesco, campione del mondo 1974, morto 2024. 274.457 viste/mese su Wikipedia italiana 2024. |
| 4 | `Juventus_Football_Club` | Juventus Football Club | 1897 | **sport** | organizzazione | 193.016 | Club calcistico più titolato d'Italia. 193.016 viste/mese su Wikipedia italiana 2024. |
| 5 | `Football_Club_Internazionale_Milano` | Football Club Internazionale Milano | 1908 | **sport** | organizzazione | 176.908 | Club calcistico di Milano, tra i più vittoriosi in Europa. 176.908 viste/mese su Wikipedia italiana 2024. |
| 6 | `Andreas_Brehme` | Andreas Brehme | 1960 | **sport** | persona | 158.614 | Segnò il gol decisivo nella finale Mondiali 1990 Italia-Germania, morto 2024. 158.614 viste/mese su Wikipedia italiana 2024. |
| 7 | `Associazione_Calcio_Milan` | Associazione Calcio Milan | 1899 | **sport** | organizzazione | 128.812 | Uno dei club calcistici più titolati al mondo, simbolo del calcio italiano. 128.812 viste/mese su Wikipedia italiana 2024. |
| 8 | `Carlos_Alcaraz_(calciatore)` | Carlos Alcaraz (calciatore) | — | **sport** | persona | 117.930 | Categoria sport sottorappresentata (2.6%). 117.930 viste/mese su Wikipedia italiana 2024. |
| 9 | `Associazione_Sportiva_Roma` | Associazione Sportiva Roma | 1927 | **sport** | organizzazione | 108.730 | Club calcistico storico della capitale italiana. 108.730 viste/mese su Wikipedia italiana 2024. |
| 10 | `Grande_Slam_(tennis)` | Grande Slam (tennis) | 1924 | **sport** | evento | 100.626 | I quattro tornei più importanti del tennis mondiale. 100.626 viste/mese su Wikipedia italiana 2024. |
| 11 | `Goffredo_Mameli` | Goffredo Mameli | 1827 | **storia** | persona | 496.777 | Poeta e patriota del Risorgimento, autore dell'inno nazionale italiano. 496.777 viste/mese su Wikipedia italiana 2024. |
| 12 | `Strage_di_Acca_Larenzia` | Strage di Acca Larenzia | 1978 | **storia** | evento | 402.460 | Episodio cruciale della violenza politica italiana. 402.460 viste/mese su Wikipedia italiana 2024. |
| 13 | `La_Storia_(romanzo)` | La Storia (romanzo) | 1974 | **arte** | opera | 373.195 | Romanzo di Elsa Morante, capolavoro della letteratura italiana del XX secolo. 373.195 viste/mese su Wikipedia italiana 2024. |
| 14 | `Anniversario_della_liberazione_d'Italia` | Anniversario della liberazione d'Italia | 1945 | **storia** | evento | 370.377 | 25 aprile, festa della Liberazione italiana. 370.377 viste/mese su Wikipedia italiana 2024. |
| 15 | `John_Travolta` | John Travolta | 1954 | **arte** | persona | 356.437 | Attore iconico, protagonista di Saturday Night Fever e Grease. 356.437 viste/mese su Wikipedia italiana 2024. |
| 16 | `Akira_Toriyama` | Akira Toriyama | 1955 | **arte** | persona | 352.679 | Mangaka, creatore di Dragon Ball, figura iconica della cultura pop mondiale, morto 2024. 352.679 viste/mese su Wikipedia italiana 2024. |
| 17 | `Dino_Grandi` | Dino Grandi | 1895 | **storia** | persona | 322.586 | Politico italiano, ruolo chiave nella caduta di Mussolini 1943. 322.586 viste/mese su Wikipedia italiana 2024. |
| 18 | `Disastro_aereo_delle_Ande` | Disastro aereo delle Ande | 1972 | **storia** | evento | 241.060 | Uno dei più famosi incidenti aerei della storia, sopravvissenza estrema. 241.060 viste/mese su Wikipedia italiana 2024. |

---

## 7. Statistiche dell'analisi

| Metrica | Valore |
|---------|--------|
| Articoli Wikipedia analizzati (4 mesi) | 2322 slug unici |
| Slug già presenti nel dataset | ~2412 |
| Esclusi (blacklist + attualità) | 94 |
| Esclusi (già presenti) | 35 |
| Esclusi (non storicamente rilevanti) | 692 |
| Esclusi (sotto soglia 50k viste) | 1465 |
| **Candidati totali sopra soglia** | **36** |
| HIGH priority (>200k viste/mese) | 11 |
| MEDIUM priority (100–200k) | 15 |
| LOW priority (50–100k) | 10 |
| Candidati che colmano lacune | 12 |

---

## 8. Note metodologiche e limitazioni

- **Falsi negativi**: alcuni articoli storicamente rilevanti potrebbero essere stati esclusi se il loro slug/titolo non contiene parole-chiave riconoscibili come "storiche". Consigliato un review manuale del report.
- **Falsi positivi**: nonostante la blacklist estesa, potrebbero esserci candidati ancora troppo contemporanei. Verificare prima dell'inserimento.
- **Stagionalità**: i mesi gen–apr 2024 hanno bias verso eventi del primo trimestre (eventi invernali, Sanremo, ecc.).
- **Classificazione automatica**: categoria e tipo suggeriti sono approssimazioni; la classificazione finale va validata manualmente.
- **KNOWN_HISTORICAL**: 25+ entità hanno classificazione manuale verificata (marcate con ✓ Lacuna dove applicabile).

---

*Report generato da `scripts/wikipedia-gap.cjs` — Viaggiatore nel Tempo*
