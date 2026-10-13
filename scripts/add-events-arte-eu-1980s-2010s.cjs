const fs = require('fs');
const path = require('path');
const eventsPath = path.join(__dirname, '../src/data/events.json');
const existing = JSON.parse(fs.readFileSync(eventsPath, 'utf8'));

// Residui: arte europea 1980s (1 evento) e 2010s (1 evento)
// + 2 musica 1920s-1930s per completezza
const newEvents = [

  // ─── 1980s EU ARTE ────────────────────────────────────────────────────────
  {"id":"ma-transavanguardia-italiana","title":"Transavanguardia: il ritorno della pittura","year":1980,"lat":41.89,"lng":12.48,"category":"arte","description":"Sandro Chia, Francesco Clemente, Enzo Cucchi e Mimmo Paladino guidano la Transavanguardia italiana, riportando la pittura figurativa al centro dell'arte contemporanea dopo anni di concettualismo. Il critico Achille Bonito Oliva conia il termine e porta il movimento alle fiere internazionali. La Transavanguardia italiana conquista New York e ridà all'Italia un ruolo centrale nell'arte globale.","wikipediaSlug":"Transavanguardia","isCosmic":false},

  {"id":"ma-documenta-beuys-eichen","title":"Joseph Beuys: 7000 Querce a Kassel","year":1982,"lat":51.31,"lng":9.49,"category":"arte","description":"Joseph Beuys alla Documenta 7 di Kassel pianta 7000 querce abbinandole a colonne di basalto, in una delle opere di arte ambientale più ambiziose del Novecento. Il progetto dura cinque anni e trasforma fisicamente la città tedesca. Beuys con il concetto di scultura sociale dimostra che l'arte può cambiare il paesaggio urbano e il pensiero ecologico.","wikipediaSlug":"7000_Oaks","isCosmic":false},

  {"id":"ma-neue-wilden-germany","title":"I Nuovi Selvaggi e la Neo-Espressionismo tedesco","year":1981,"lat":52.52,"lng":13.41,"category":"arte","description":"Georg Baselitz, Anselm Kiefer e Markus Lüpertz guidano il movimento dei Nuovi Selvaggi (Neue Wilden), riportando la pittura espressionista tedesca al centro del mercato dell'arte mondiale. Kiefer in particolare affronta la memoria della Seconda Guerra Mondiale con materiali come piombo, paglia e cenere. La Germania si riafferma come potenza nell'arte contemporanea internazionale.","wikipediaSlug":"Neo-expressionism","isCosmic":false},

  // ─── 2010s EU ARTE ────────────────────────────────────────────────────────
  {"id":"ma-olafur-eliasson-cop21","title":"Olafur Eliasson: arte e crisi climatica a Parigi","year":2015,"lat":48.85,"lng":2.35,"category":"arte","description":"Olafur Eliasson porta blocchi di ghiaccio groenlandesi davanti al Panthéon di Parigi durante la COP21, creando Ice Watch, un'opera che rende visibile lo scioglimento dei ghiacciai. L'artista danese-islandese è il più importante artista ambientale europeo, con installazioni luminose nei musei di tutto il mondo. Eliasson dimostra che l'arte può contribuire al dibattito scientifico e politico.","wikipediaSlug":"Olafur_Eliasson","isCosmic":false},

  {"id":"ma-dismaland-banksy","title":"Banksy: Dismaland, il parco dei divertimenti distopico","year":2015,"lat":51.34,"lng":-2.98,"category":"arte","description":"Banksy costruisce Dismaland a Weston-super-Mare, un parco dei divertimenti distopico con 58 artisti internazionali che critica il consumismo e la cultura Disney. In cinque settimane richiama 150.000 visitatori da tutto il mondo. Il progetto è la più grande installazione artistica temporanea mai realizzata nel Regno Unito e afferma Banksy come il più influente street artist vivente.","wikipediaSlug":"Dismaland","isCosmic":false},

  {"id":"ma-documenta-athens-2017","title":"Documenta 14: Kassel e Atene unite dall'arte","year":2017,"lat":37.97,"lng":23.73,"category":"arte","description":"Documenta 14 si svolge per la prima volta in due città — Kassel e Atene — portando l'arte contemporanea nel cuore della crisi greca come atto di solidarietà politica e culturale. La mostra quinquennale più importante del mondo sceglie Atene per riflettere sui confini europei e la crisi dei rifugiati. Documenta conferma il suo ruolo di bussola dell'arte contemporanea mondiale.","wikipediaSlug":"Documenta_14","isCosmic":false},

  {"id":"ma-tate-modern-expansion","title":"La Tate Modern e il boom dei musei europei","year":2016,"lat":51.51,"lng":-0.10,"category":"arte","description":"L'espansione della Tate Modern di Londra con la Switch House di Herzog & de Meuron porta il museo a 5,8 milioni di visitatori l'anno, confermando Londra come la capitale europea dell'arte contemporanea. Il modello della Tate — arte gratuita e architettura spettacolare in un ex edificio industriale — viene replicato in tutto il mondo. Il turismo culturale diventa industria miliardaria in Europa.","wikipediaSlug":"Tate_Modern","isCosmic":false},

  // ─── 1920s-1930s EU MUSICA (piccolo arricchimento) ────────────────────────
  {"id":"ma-django-reinhardt-jazz","title":"Django Reinhardt e il jazz manouche","year":1934,"lat":48.85,"lng":2.35,"category":"musica","description":"Django Reinhardt, chitarrista belga di origini rom, inventa il jazz manouche suonando con due sole dita della mano sinistra dopo l'incendio che lo sfigurò. Con il violinista Stéphane Grappelli fonda il Quintette du Hot Club de France, portando la musica afroamericana in un contesto europeo originale. Django è il primo musicista europeo ad avere un impatto globale sul jazz americano.","wikipediaSlug":"Django_Reinhardt","isCosmic":false},

  {"id":"ma-marlene-dietrich-weimar","title":"Marlene Dietrich e il cabaret di Weimar","year":1930,"lat":52.52,"lng":13.41,"category":"musica","description":"Marlene Dietrich emerge nel cabaret berlinese dell'era di Weimar con L'Angelo Azzurro, diventando la star internazionale più famosa della Germania. La sua voce profonda e la sua presenza androgina rivoluzionano i canoni dell'intrattenimento e della femminilità. Dopo l'ascesa del nazismo, Dietrich rifiuta di tornare in Germania e diventa simbolo della resistenza culturale.","wikipediaSlug":"Marlene_Dietrich","isCosmic":false},
];

const existingIds = new Set(existing.map(function(e) { return e.id; }));
const toAdd = newEvents.filter(function(e) {
  if (existingIds.has(e.id)) { console.log('Skip: ' + e.id); return false; }
  return true;
});
const merged = existing.concat(toAdd);
fs.writeFileSync(eventsPath, JSON.stringify(merged, null, 2), 'utf8');
console.log('Added ' + toAdd.length + ' events. Total: ' + merged.length);
