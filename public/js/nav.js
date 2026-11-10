// Chargé par toutes les pages : ajoute l'en-tête et le pied de page,
// et construit le menu selon que l'utilisateur est connecté ou pas.

import { supabase } from './supabase.js';

let profilEnCache = null;

// Renvoie le profil de la personne connectée (ou null).
// On garde le résultat pour ne pas refaire la requête à chaque appel :
// le menu et la page en ont besoin tous les deux.
export function getProfilConnecte() {
    if (!profilEnCache) profilEnCache = chargerProfil();
    return profilEnCache;
}

async function chargerProfil() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const { data, error } = await supabase
        .from('profiles')
        .select('id, email, nom, prenom, telephone, role')
        .eq('id', session.user.id)
        .single();

    return error ? null : data;
}

// À appeler en haut des pages privées.
// Pas connecté -> page de connexion. Mauvais rôle -> renvoyé vers son espace.
// Ce n'est que de l'affichage : la vraie protection, ce sont les règles RLS.
export async function exigerConnexion(role) {
    const profil = await getProfilConnecte();

    if (!profil) {
        location.replace('login.html');
        return null;
    }
    if (role && profil.role !== role) {
        location.replace(profil.role === 'admin' ? 'admin.html' : 'accueil.html');
        return null;
    }
    return profil;
}

function afficherHeaderEtFooter() {
    const header = document.getElementById('header');
    const footer = document.getElementById('footer');

    if (header) {
        header.innerHTML = `
            <header>
                <a href="index.html" class="logo">
                    <img src="img/logo.svg" alt="" width="40" height="40">
                    <span>Find<b>My</b>Car</span>
                </a>
                <nav id="nav"></nav>
            </header>`;
    }
    if (footer) {
        footer.innerHTML = `
            <footer>
                <p><strong>FindMyCar</strong> - Trouvez la voiture qu'il vous faut, au bon prix</p>
                <p id="lien-contact" hidden><a href="contact.html">Nous contacter</a></p>
            </footer>`;
    }
}

async function afficherMenu() {
    const nav = document.getElementById('nav');
    if (!nav) return;

    const profil = await getProfilConnecte();

    function lien(texte, href) {
        const a = document.createElement('a');
        a.href = href;
        a.textContent = texte;
        nav.append(a);
    }

    lien('Accueil', 'index.html');

    if (!profil) {
        lien('Connexion', 'login.html');
        lien('Inscription', 'register.html');
        return;
    }

    if (profil.role === 'admin') {
        lien('Espace admin', 'admin.html');
    } else {
        lien('Mon espace', 'accueil.html');
        // le contact est seulement pour les clients, l'admin lit les messages
        lien('Contact', 'contact.html');
        document.getElementById('lien-contact')?.removeAttribute('hidden');
    }
    lien('Se déconnecter', 'logout.html');

    const nom = document.createElement('span');
    nom.textContent = `(connecté : ${profil.prenom ?? profil.email})`;
    nav.append(nom);
}

afficherHeaderEtFooter();
await afficherMenu();
