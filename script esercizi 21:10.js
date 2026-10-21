/*
REGOLE
- Le risposte vanno scritte in JavaScript sotto questi commenti.
- Pattern fondamentale: stato -> render() -> eventi.
  Tutto cio' che vedi a schermo dipende dallo stato.
  Gli eventi modificano lo stato e poi chiamano render().
- Apri index.html nel browser. Apri la console (DevTools) per gli errori.
- Cerca su MDN solo i concetti dichiarati come "cerca tu":
  localStorage, Blob/URL.createObjectURL, FileReader.
  Tutto il resto e' stato visto in settimana.
- Niente AI per generare codice. Niente template scaricati.
*/


/* STATO — un array di oggetti e il filtro corrente */
const $ = s => document.querySelector(s);
let stato = { elementi: [], filtro: "tutti" };


/* RENDER() — filtra, ridisegna la lista, aggiorna il conteggio, salva in localStorage */
const esc = s => s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const filtri = { tutti: () => true, attivi: x => !x.fatto, completati: x => x.fatto };

function render() {
  $("#lista").innerHTML = stato.elementi.filter(filtri[stato.filtro]).map(x => `
    <li class="${x.fatto ? "fatto" : ""}">
      <input type="checkbox" data-id="${x.id}" ${x.fatto ? "checked" : ""}>
      <span>${esc(x.testo)}</span>
      <button data-id="${x.id}">Elimina</button>
    </li>`).join("");
  $("#statistiche").innerHTML = `<p>Attivi: ${stato.elementi.filter(x => !x.fatto).length}</p>`;
  document.querySelectorAll("[data-filtro]").forEach(b => b.classList.toggle("attiva", b.dataset.filtro === stato.filtro));
  localStorage.setItem("dati", JSON.stringify(stato));
  console.log("render:", stato);
}


/* FORM CON VALIDAZIONE
   addEventListener("submit") sul form.
   event.preventDefault().
   Leggi i valori con .value.trim().
   Se uno dei campi obbligatori e' vuoto, mostra errore e return.
   Altrimenti push allo stato, form.reset(), render().
   Id univoco con Date.now().
*/

$("#form").addEventListener("submit", e => {
  e.preventDefault();
  const testo = $("#testo").value.trim();
  if (!testo) return notifica("Scrivi cosa devi fare!");
  stato.elementi.push({ id: Date.now(), testo, fatto: false });
  console.log("aggiunto:", stato.elementi.at(-1));
  e.target.reset();
  render();
});


/* INTERAZIONI — spunta ed elimina, con event delegation su #lista */
$("#lista").addEventListener("change", e => {
  stato.elementi.find(x => x.id === +e.target.dataset.id).fatto = e.target.checked;
  console.log("spunta:", e.target.dataset.id, e.target.checked);
  render();
});

$("#lista").addEventListener("click", e => {
  if (e.target.tagName !== "BUTTON") return;
  stato.elementi = stato.elementi.filter(x => x.id !== +e.target.dataset.id);
  console.log("elimina:", e.target.dataset.id);
  render();
});


/* FILTRO — pulsanti Tutti / Attivi / Completati */
document.querySelectorAll("[data-filtro]").forEach(b => b.addEventListener("click", () => {
  stato.filtro = b.dataset.filtro;
  console.log("filtro:", stato.filtro);
  render();
}));


/* NOTIFICHE TEMPORANEE
   Funzione notifica(testo) che imposta il testo del <div id="notifica">,
   lo mostra (display: block), poi dopo 3000ms (setTimeout) lo nasconde.
*/

let timer;
function notifica(testo) {
  const n = $("#notifica");
  console.log("notifica:", testo);
  n.textContent = testo;
  n.style.display = "block";
  clearTimeout(timer);
  timer = setTimeout(() => (n.style.display = "none"), 3000);
}


/* PERSISTENZA — localStorage (cerca tu su MDN)
   - In fondo a render(), salva lo stato:
       localStorage.setItem("dati", JSON.stringify(stato));
   - All'avvio, prima della prima render(), carica:
       const salvato = localStorage.getItem("dati");
       if (salvato) stato = JSON.parse(salvato);
*/

const salvato = localStorage.getItem("dati");
if (salvato) stato = JSON.parse(salvato);
console.log("caricato:", stato);

/* AVVIO */
render();
