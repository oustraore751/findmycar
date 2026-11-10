// Fonctions utilisées dans plusieurs pages.
// Les textes qui viennent de la base sont toujours mis avec textContent,
// jamais innerHTML, pour éviter qu'un utilisateur injecte du HTML.

export const LIBELLES_STATUT = {
    en_attente: 'En attente',
    acceptee: 'Acceptée',
    refusee: 'Refusée',
    annulee: 'Annulée'
};

// Affiche un message dans le <p id="message"> de la page (rouge par défaut, vert si succès)
export function afficherMessage(texte, erreur = true) {
    const zone = document.getElementById('message');
    zone.textContent = texte;
    zone.style.color = erreur ? 'crimson' : 'green';
    zone.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// "2026-11-10" -> "10/11/2026"
export function formatDate(date) {
    return new Date(date + 'T00:00:00').toLocaleDateString('fr-FR');
}

export function formatPrix(prix) {
    if (prix == null) return '-';
    return Number(prix).toFixed(2) + ' €';
}

// Ajoute une case à une ligne de tableau. contenu = du texte ou un élément HTML.
export function ajouterCellule(ligne, contenu = '') {
    const td = document.createElement('td');
    if (contenu instanceof Node) td.append(contenu);
    else td.textContent = contenu;
    ligne.append(td);
    return td;
}

// Ligne "Aucun résultat" qui prend toute la largeur du tableau
export function ligneVide(tbody, texte, nbColonnes) {
    const ligne = document.createElement('tr');
    ajouterCellule(ligne, texte).colSpan = nbColonnes;
    tbody.append(ligne);
}

export function creerBouton(texte, action, classe = '') {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = texte;
    if (classe) btn.className = classe;
    btn.addEventListener('click', action);
    return btn;
}

// Petite étiquette colorée (les couleurs sont dans style.css : .statut-acceptee, etc.)
export function creerBadge(texte, statut) {
    const span = document.createElement('span');
    span.className = 'statut statut-' + statut;
    span.textContent = texte;
    return span;
}
