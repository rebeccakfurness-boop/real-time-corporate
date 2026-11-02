// One-time fix, run from the Vercel build command.
//
// The demo accounts were originally seeded under the internal codename's
// placeholder domains (@chnnl.demo, @chnnl.internal). This renames the
// already-created rows to the real domain and sets the matching new
// demo passwords, so they match what prisma/seed.ts now produces.
//
// Gated by RUN_DB_RENAME=true so it is a no-op on every ordinary build;
// remove it from the Vercel build command once it has run successfully.

if (process.env.RUN_DB_RENAME !== 'true') {
  console.log('[rename-demo-accounts] RUN_DB_RENAME not set, skipping.');
  process.exit(0);
}

const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const bcrypt = require('bcryptjs');

const ownerUrl = process.env.MIGRATE_DATABASE_URL;
if (!ownerUrl) {
  console.error('[rename-demo-accounts] MIGRATE_DATABASE_URL is not set.');
  process.exit(1);
}

function redact(s) {
  return s.replace(/postgresql:\/\/[^\s]+/g, '<redacted-url>');
}

function run(cmd, args, opts = {}) {
  console.log('[rename-demo-accounts] $', redact([cmd, ...args].join(' ')));
  execFileSync(cmd, args, { stdio: 'inherit', ...opts });
}

const demoPasswordHash = bcrypt.hashSync('RealtimeDemo123!', 12);
const staffPasswordHash = bcrypt.hashSync('RealtimeStaff123!', 12);
const esc = (v) => v.replace(/'/g, "''");

const tenantEmailMap = [
  ['owner@chnnl.demo', 'owner@realtime-wellbeing.com'],
  ['admin@chnnl.demo', 'admin@realtime-wellbeing.com'],
  ['exec@chnnl.demo', 'exec@realtime-wellbeing.com'],
  ['peopleculture@chnnl.demo', 'peopleculture@realtime-wellbeing.com'],
  ['healthsafety@chnnl.demo', 'healthsafety@realtime-wellbeing.com'],
  ['manager@chnnl.demo', 'manager@realtime-wellbeing.com'],
  ['leader@chnnl.demo', 'leader@realtime-wellbeing.com'],
  ['employee@chnnl.demo', 'employee@realtime-wellbeing.com'],
];
const staffEmailMap = [
  ['staff-super@chnnl.internal', 'staff-super@realtime-wellbeing.com'],
  ['staff-safety@chnnl.internal', 'staff-safety@realtime-wellbeing.com'],
  ['staff-support@chnnl.internal', 'staff-support@realtime-wellbeing.com'],
];

let sql = '';
for (const [oldEmail, newEmail] of tenantEmailMap) {
  sql += `UPDATE identity.identity_records SET email = '${esc(newEmail)}', "passwordHash" = '${esc(demoPasswordHash)}' WHERE email = '${esc(oldEmail)}';\n`;
}
for (const [oldEmail, newEmail] of staffEmailMap) {
  sql += `UPDATE platform.platform_staff_accounts SET email = '${esc(newEmail)}', "passwordHash" = '${esc(staffPasswordHash)}' WHERE email = '${esc(oldEmail)}';\n`;
}

const sqlPath = path.join(os.tmpdir(), 'rename-demo-accounts.sql');
fs.writeFileSync(sqlPath, sql);
run('npx', ['prisma', 'db', 'execute', '--file', sqlPath, '--url', ownerUrl]);
fs.unlinkSync(sqlPath);

console.log('[rename-demo-accounts] Done. Demo accounts now use @realtime-wellbeing.com and the new passwords.');
