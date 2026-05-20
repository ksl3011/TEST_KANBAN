// Supabase 프로젝트 설정 — 설정 절차: OAUTH.md 참조
const SUPABASE_URL = 'https://YOUR_PROJECT_REF.supabase.co';
const SUPABASE_KEY = 'YOUR_ANON_KEY';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
