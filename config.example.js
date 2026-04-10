/**
 * Finance Toolkit — Supabase Configuration Template
 *
 * To enable cloud sync and authentication:
 *
 * 1. Create a free project at https://supabase.com
 * 2. Copy this file to config.js (it is gitignored — safe for your keys)
 * 3. Replace the placeholder values below with your project's URL and anon key
 *    (found in: Supabase dashboard → Project Settings → API)
 * 4. Run the migration in /supabase/migrations/001_tool_states.sql
 *
 * If config.js is absent or contains placeholder values, the app runs
 * entirely on localStorage with no auth — all tools still work normally.
 *
 * IMPORTANT: Never commit config.js. It is listed in .gitignore.
 * For production deployments, inject via GitHub Actions secrets (see README).
 */
window.APP_CONFIG = {
  supabaseUrl:  'https://YOUR_PROJECT_REF.supabase.co',
  supabaseKey:  'YOUR_ANON_KEY_HERE',

  // Google Analytics 4 Measurement ID (optional)
  // Create a GA4 property at https://analytics.google.com and paste your
  // Measurement ID here. Leave blank to disable analytics.
  gaMeasurementId: 'G-XXXXXXXXXX',
};
