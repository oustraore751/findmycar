// Connexion à Supabase, importée par toutes les pages.
// La clé "publishable" peut être visible dans le navigateur, c'est prévu comme ça :
// ce sont les règles RLS de la base qui protègent les données.
// Ne jamais mettre la clé service_role ici !

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://jwunvhnuiugzjipeatnw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_jEErtcywuvl94r8Ka0cv5Q_DCS5Ehyo';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
