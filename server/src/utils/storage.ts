import { createClient, SupabaseClient } from '@supabase/supabase-js';

const BUCKET = 'uploads';

let _supabase: SupabaseClient | null = null;
const getSupabase = () => {
  if (!_supabase) {
    _supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _supabase;
};

export async function deleteStorageFiles(urls: string[]): Promise<void> {
  if (!urls || urls.length === 0) return;

  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const filenames = urls
    .filter((u) => typeof u === 'string' && u.includes(marker))
    .map((u) => u.split(marker)[1])
    .filter(Boolean);

  if (filenames.length === 0) return;

  const { error } = await getSupabase().storage.from(BUCKET).remove(filenames);
  if (error) console.error('Storage cleanup error:', error.message);
}
