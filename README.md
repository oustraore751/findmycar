# FindMyCar

Site de location de voitures. Les visiteurs consultent le catalogue, les clients réservent un véhicule et suivent leurs demandes, et un administrateur gère le parc automobile, les réservations et les messages reçus.

## Fonctionnalités

**Visiteur**
- Parcourir le catalogue des voitures disponibles (`index.html`)
- Voir la fiche détaillée d'une voiture avec ses photos (`voiture.html`)
- Envoyer un message via le formulaire de contact (`contact.html`)
- Créer un compte et se connecter (`register.html`, `login.html`)

**Client connecté** (`accueil.html`)
- Faire une demande de location (le prix total est calculé automatiquement côté base)
- Suivre ses locations et leur statut
- Annuler une demande encore en attente

**Administrateur**
- Valider ou refuser les demandes de location (`admin.html`)
- Ajouter, modifier, supprimer des véhicules, les rendre disponibles ou non et gérer leurs photos (`admin-vehicules.html`)
- Lire et supprimer les messages de contact (`admin-messages.html`)

## Technologies

- **HTML / CSS / JavaScript** (modules ES, sans framework)
- **[Supabase](https://supabase.com)** pour :
  - l'authentification (inscription / connexion)
  - la base de données PostgreSQL
  - le stockage des photos (bucket `voitures`)
  - la sécurité via les règles RLS (Row Level Security)

## Structure du projet

```
├── public/                  # Le site
│   ├── index.html           # Accueil et catalogue
│   ├── voiture.html         # Fiche d'une voiture
│   ├── login.html           # Connexion
│   ├── register.html        # Inscription
│   ├── logout.html          # Déconnexion
│   ├── accueil.html         # Espace client
│   ├── contact.html         # Formulaire de contact
│   ├── admin.html           # Admin : réservations
│   ├── admin-vehicules.html # Admin : gestion des véhicules
│   ├── admin-messages.html  # Admin : messages reçus
│   ├── css/style.css
│   ├── img/logo.svg
│   └── js/
│       ├── supabase.js      # Connexion à Supabase
│       ├── nav.js           # Barre de navigation selon le rôle
│       └── utils.js         # Fonctions communes
└── sql/
    └── findmycar_ajouts.sql # Tables et règles de sécurité à exécuter dans Supabase
```

## Base de données

Tables utilisées : `profiles`, `voitures`, `voitures_photos`, `locations`, `messages_contact`.

Le fichier [sql/findmycar_ajouts.sql](sql/findmycar_ajouts.sql) crée les tables manquantes, le bucket de photos et les règles RLS. Il se lance dans **Supabase → SQL Editor** et peut être relancé sans risque.

Un utilisateur devient administrateur quand la colonne `role` de sa ligne dans `profiles` vaut `admin`.

## Lancer le projet en local

1. Placer le dossier dans `C:\MAMP\htdocs\` (ou le dossier web de n'importe quel serveur local)
2. Démarrer MAMP
3. Ouvrir http://localhost/php/Auth/public/index.html

> Les pages utilisent des modules JavaScript : il faut passer par un serveur local (MAMP, Live Server…). Ouvrir le fichier directement en double-cliquant ne fonctionne pas.

## Sécurité

La clé présente dans `public/js/supabase.js` est la clé **publishable** de Supabase. Elle est prévue pour être visible côté navigateur. Ce sont les règles RLS de la base qui protègent les données. La clé `service_role` ne doit jamais être mise dans le code.
