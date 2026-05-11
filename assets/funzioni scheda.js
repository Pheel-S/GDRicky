// Caricamento dati salvati
window.addEventListener("DOMContentLoaded", () => {
    const dati = JSON.parse(localStorage.getItem("scheda")) || {};

    document.querySelectorAll("input, textarea").forEach(campo => {
        if (dati[campo.id] !== undefined) {
            campo.value = dati[campo.id];
        }
    });

    // Carica timestamp
    const timestamp = localStorage.getItem("scheda_ultima_modifica");
    const spanData = document.getElementById("data-salvataggio");
    if (spanData) spanData.textContent = timestamp || "mai";
});

// Funzione salvataggio
function salvaDati() {
    let dati = {};

    document.querySelectorAll("input, textarea").forEach(campo => {
        dati[campo.id] = campo.value;
    });

    localStorage.setItem("scheda", JSON.stringify(dati));

    // Salva timestamp
    const ora = new Date();
    const timestamp = ora.toLocaleString(); // formattazione leggibile
    localStorage.setItem("scheda_ultima_modifica", timestamp);

    // Aggiorna la pagina
    const spanData = document.getElementById("data-salvataggio");
    if (spanData) spanData.textContent = timestamp;
}

// Pulsanti +
document.querySelectorAll(".piu").forEach(button => {
    button.addEventListener("click", () => {
        const stat = button.dataset.stat;
        const input = document.getElementById(stat);

        input.value = parseInt(input.value || 0) + 1;
        salvaDati();
    });
});

// Pulsanti -
document.querySelectorAll(".meno").forEach(button => {
    button.addEventListener("click", () => {
        const stat = button.dataset.stat;
        const input = document.getElementById(stat);

        let valore = parseInt(input.value || 0);
        if (valore > 0) {
            input.value = valore - 1;
            salvaDati();
        }
    });
});

// Salvataggio se l’utente scrive a mano
document.querySelectorAll("input, textarea").forEach(campo => {
    campo.addEventListener("input", salvaDati);
});

// Salvataggio dati scheda per backup in JSON 
document.getElementById("esporta").addEventListener("click", () => {

     // salva mostra metadata
     const exportData = {
        meta: {
            nome_personaggio: dati.nome || "Personaggio",
            data_export: new Date().toISOString(),
            versione: "1.0"
        },
        scheda: dati
    };
    
    // Recupera i dati attuali salvati
    const dati = JSON.parse(localStorage.getItem("scheda")) || {};

    // Converte in formato JSON leggibile
    const json = JSON.stringify(dati, null, 2);

    // Crea file scaricabile
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "scheda.json";
    a.click();

    URL.revokeObjectURL(url);
});

// Pulsante importa
document.getElementById("importa").addEventListener("click", () => {
    document.getElementById("importaFile").click();
});

document.getElementById("importaFile").addEventListener("change", function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function(e) {
        try {
            const dati = JSON.parse(e.target.result);

            // Controlla se il file ha struttura corretta
            if (!datiImport.scheda) throw "File JSON non valido";

            // Conferma sovrascrittura
            if (localStorage.getItem("scheda")) {
                const conferma = confirm("Sei sicuro di voler sovrascrivere la scheda esistente?");
                if (!conferma) return;
            }

            // Salva nel localStorage
            localStorage.setItem("scheda", JSON.stringify(dati));

            // Aggiorna i campi nella pagina
            document.querySelectorAll("input, textarea").forEach(campo => {
                if (dati[campo.id] !== undefined) {
                    campo.value = dati[campo.id];
                }
            });

            alert("Scheda importata con successo!");
        } catch (errore) {
            alert("Errore: il file selezionato non è valido.");
        }
    };

    reader.readAsText(file);

});

//reset scheda
document.getElementById("reset").addEventListener("click", () => {
    const conferma = confirm("Sei sicuro di voler cancellare tutti i dati della scheda? Questa azione non può essere annullata.");
    if (!conferma) return;

    // Rimuove dati e timestamp dal localStorage
    localStorage.removeItem("scheda");
    localStorage.removeItem("scheda_ultima_modifica");

    // Reset dei campi nella pagina
    document.querySelectorAll("input, textarea").forEach(campo => {
        campo.value = "";
    });

    // Aggiorna la data di salvataggio
    const spanData = document.getElementById("data-salvataggio");
    if (spanData) spanData.textContent = "mai";

    alert("Scheda resettata! Ora puoi iniziare una nuova avventura.");
});

const contenitoreOggetti = document.getElementById("contenitoreOggetti");
const btnAggiungiOggetto = document.getElementById("aggiungiOggetto");

//Crea oggetto
function creaOggetto(dati = { categoria: "", nome: "", bonus: "" }) {

    const div = document.createElement("div");
    div.classList.add("oggetto-equipaggiamento");

    div.innerHTML = `
        <h3>categoria:
            <textarea class="categoria-oggetto-equipaggiamento" rows="1">${dati.categoria}</textarea>
        </h3>

        <h3>oggetto:
            <textarea class="nome-oggetto-equipaggiamento" rows="1">${dati.nome}</textarea>
        </h3>

        <h3>bonus:
            <textarea class="bonus-oggetto-equipaggiamento" rows="1">${dati.bonus}</textarea>
        </h3>

        <button class="rimuoviOggetto">Rimuovi</button>
    `;

    // Salvataggio automatico
    div.querySelectorAll("textarea").forEach(textarea => {
        textarea.addEventListener("input", () => {
            salvaEquipaggiamento();
        });
    });

    //Rimozione
    div.querySelector(".rimuoviOggetto").addEventListener("click", () => {
        if (confirm("Vuoi rimuovere questo oggetto?")) {
            div.remove();
            salvaEquipaggiamento();
        }
    });

    contenitoreOggetti.appendChild(div);
}

// Salva equipaggiamento
function salvaEquipaggiamento() {

    const scheda = JSON.parse(localStorage.getItem("scheda")) || {};

    scheda.equipaggiamento = [];

    document.querySelectorAll(".oggetto-equipaggiamento").forEach(div => {

        scheda.equipaggiamento.push({
            categoria: div.querySelector(".categoria-oggetto-equipaggiamento").value,
            nome: div.querySelector(".nome-oggetto-equipaggiamento").value,
            bonus: div.querySelector(".bonus-oggetto-equipaggiamento").value
        });

    });

    localStorage.setItem("scheda", JSON.stringify(scheda));
}

// Carica equipaggiamento
function caricaEquipaggiamento() {

    const scheda = JSON.parse(localStorage.getItem("scheda")) || {};
    contenitoreOggetti.innerHTML = "";

    if (!scheda.equipaggiamento) return;

    scheda.equipaggiamento.forEach(oggetto => {
        creaOggetto(oggetto);
    });
}

//Aggiungi nupovo oggetto in equipaggiamento
btnAggiungiOggetto.addEventListener("click", () => {
    creaOggetto();
    salvaEquipaggiamento();
});

//Caricamento equipaggiamento all'avvio
window.addEventListener("DOMContentLoaded", caricaEquipaggiamento);


const contenitoreAbilita = document.getElementById("contenitoreAbilita");
const btnAggiungiAbilita = document.getElementById("aggiungiAbilita");

// Crea impresa/abilità
function creaAbilita(dati = {
    nome: "",
    descrizione: "",
    progressiApprendimento: 0,
    completata: false,
    livello: 0,
    progressiLivello: 0
}) {

    const div = document.createElement("div");
    div.classList.add("impresa");

    div.innerHTML = `
        <textarea class="nome-abilita" placeholder="Nome impresa/abilità">${dati.nome}</textarea>
        <textarea class="descrizione-abilita" placeholder="Descrizione">${dati.descrizione}</textarea>

        <div class="apprendimento-container">
            <strong>Progresso Impresa</strong>
            <div class="progressione-apprendimento"></div>
        </div>

        <div class="livello-container" style="margin-top:8px; display:${dati.completata ? "block" : "none"};">
            <strong>Abilità</strong><br>
            Livello: <span class="livello">${dati.livello}</span>
            <div class="progressione-livello"></div>
        </div>

        <button class="rimuoviAbilita">Rimuovi</button>
        <hr>
    `;

    //Checkbox/progresso impresa

    const apprendimentoDiv = div.querySelector(".progressione-apprendimento");

    for (let i = 0; i < 10; i++) {
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";

        if (i < dati.progressiApprendimento) checkbox.checked = true;
        if (dati.completata) checkbox.disabled = true;

        checkbox.addEventListener("change", () => {

            const checked = div.querySelectorAll(".progressione-apprendimento input:checked").length;

            if (checked >= 10) {

                alert("Impresa completata! Ora è diventata un'Abilità.");

                // Disabilita checkbox apprendimento
                div.querySelectorAll(".progressione-apprendimento input")
                    .forEach(cb => cb.disabled = true);

                // Mostra area livello
                div.querySelector(".livello-container").style.display = "block";
            }

            salvaAbilita();
        });

        apprendimentoDiv.appendChild(checkbox);
    }

    // checkbox/progresso del livello abilità appresa

    const livelloDiv = div.querySelector(".progressione-livello");

    for (let i = 0; i < 10; i++) {

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";

        if (i < dati.progressiLivello) checkbox.checked = true;

        checkbox.addEventListener("change", () => {

            const checked = div.querySelectorAll(".progressione-livello input:checked").length;

            if (checked >= 10) {

                alert("Complimenti! Puoi aumentare l'abilità di un livello!");

                // Aumenta livello
                const livelloSpan = div.querySelector(".livello");
                livelloSpan.textContent = parseInt(livelloSpan.textContent) + 1;

                // Reset checkbox livello
                div.querySelectorAll(".progressione-livello input")
                    .forEach(cb => cb.checked = false);
            }

            salvaAbilita();
        });

        livelloDiv.appendChild(checkbox);
    }

    // Salvataggio automatico del testo
    div.querySelectorAll("textarea").forEach(textarea => {
        textarea.addEventListener("input", salvaAbilita);
    });

    // Rimozione impresa
    div.querySelector(".rimuoviAbilita").addEventListener("click", () => {
        if (confirm("Vuoi rimuovere questa impresa/abilità?")) {
            div.remove();
            salvaAbilita();
        }
    });

    contenitoreAbilita.appendChild(div);
}

// salvataggio abilità
function salvaAbilita() {

    const scheda = JSON.parse(localStorage.getItem("scheda")) || {};
    scheda.abilita = [];

    document.querySelectorAll(".impresa").forEach(div => {

        const progressiApprendimento =
            div.querySelectorAll(".progressione-apprendimento input:checked").length;

        const progressiLivello =
            div.querySelectorAll(".progressione-livello input:checked").length;

        const completata = progressiApprendimento >= 10;

        scheda.abilita.push({
            nome: div.querySelector(".nome-abilita").value,
            descrizione: div.querySelector(".descrizione-abilita").value,
            progressiApprendimento: progressiApprendimento,
            completata: completata,
            livello: parseInt(div.querySelector(".livello").textContent),
            progressiLivello: progressiLivello
        });

    });

    localStorage.setItem("scheda", JSON.stringify(scheda));
}

// Carica abilità
function caricaAbilita() {

    const scheda = JSON.parse(localStorage.getItem("scheda")) || {};
    contenitoreAbilita.innerHTML = "";

    if (!scheda.abilita) return;

    scheda.abilita.forEach(abilita => {
        creaAbilita(abilita);
    });
}

// Aggiungi nuova abilità
btnAggiungiAbilita.addEventListener("click", () => {
    creaAbilita();
    salvaAbilita();
});

// Carica abilità all'avvio della scheda
window.addEventListener("DOMContentLoaded", caricaAbilita);

// Barra punto generico
function creaPuntoGenerico() {

    const container = document.querySelector(".progressione-generico");
    container.innerHTML = "";

    const scheda = JSON.parse(localStorage.getItem("scheda")) || {};
    const progressiSalvati = scheda.puntoGenerico || 0;

    for (let i = 0; i < 10; i++) {

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";

        if (i < progressiSalvati) checkbox.checked = true;

        checkbox.addEventListener("change", () => {

            const checked = container.querySelectorAll("input:checked").length;

            if (checked >= 10) {

                alert("Complimenti puoi aggiungere +1 ad una caratteristica base!");

                // Reset
                container.querySelectorAll("input")
                    .forEach(cb => cb.checked = false);

                scheda.puntoGenerico = 0;
            } else {
                scheda.puntoGenerico = checked;
            }

            localStorage.setItem("scheda", JSON.stringify(scheda));
        });

        container.appendChild(checkbox);
    }
}

/* Carica all'avvio */
window.addEventListener("DOMContentLoaded", creaPuntoGenerico);

//Tabella afflizioni
const elencoAfflizioni = [
    "Ferita alla testa",
    "Ferita al petto",
    "Braccio sinistro",
    "Braccio destro",
    "Gamba sinistra",
    "Gamba destra",
    "Stordimento",
    "Oggetto distrutto"
];

function creaTabellaAfflizioni() {

    const container = document.getElementById("contenitoreAfflizioni");
    container.innerHTML = "";

    const scheda = JSON.parse(localStorage.getItem("scheda")) || {};
    scheda.afflizioni = scheda.afflizioni || {};

    elencoAfflizioni.forEach(nome => {

        const div = document.createElement("div");
        div.classList.add("afflizione");

        const titolo = document.createElement("strong");
        titolo.textContent = nome;

        const progressione = document.createElement("div");
        progressione.classList.add("progressione-afflizione");

        const danniSalvati = scheda.afflizioni[nome] || 0;

        for (let i = 0; i < 3; i++) {

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";

            if (i < danniSalvati) checkbox.checked = true;

            checkbox.addEventListener("change", () => {

                // Rilegge sempre la scheda aggiornata
                const schedaAggiornata = JSON.parse(localStorage.getItem("scheda")) || {};
                schedaAggiornata.afflizioni = schedaAggiornata.afflizioni || {};

                const checked = progressione.querySelectorAll("input:checked").length;

                schedaAggiornata.afflizioni[nome] = checked;

                if (checked === 3) {
                    alert(nome + " è irrimediabilmente compromessa!");
                }

                localStorage.setItem("scheda", JSON.stringify(schedaAggiornata));
            });

            progressione.appendChild(checkbox);
        }

        div.appendChild(titolo);
        div.appendChild(progressione);
        container.appendChild(div);
    });
}


window.addEventListener("DOMContentLoaded", creaTabellaAfflizioni);