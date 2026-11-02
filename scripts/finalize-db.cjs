// One-time finalize step, run from the Vercel build command.
//
// The earlier bootstrap run (migration + role creation + most of the demo
// seed) completed, but stalled partway through seeding historical check-in
// data and never reached password rotation's final print step or the
// platform-staff accounts. This script is fast and does only what's left:
//
//   1. Rotate the three app-facing role passwords again (the in-flight
//      rotation from the stalled run already changed them once, but that
//      value was never captured, so we rotate to a fresh known value).
//   2. Create the three platform-staff accounts (chnnl-internal staff,
//      separate from tenant accounts), if not already present.
//   3. Print the resulting per-role connection strings.
//
// Gated by RUN_DB_FINALIZE=true so it is a no-op on every ordinary build;
// remove it from the Vercel build command once it has run successfully.

if (process.env.RUN_DB_FINALIZE !== 'true') {
  console.log('[finalize-db] RUN_DB_FINALIZE not set, skipping.');
  process.exit(0);
}

const { execFileSync } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const bcrypt = require('bcryptjs');

const ownerUrl = process.env.MIGRATE_DATABASE_URL;
if (!ownerUrl) {
  console.error('[finalize-db] MIGRATE_DATABASE_URL is not set.');
  process.exit(1);
}

function redact(s) {
  return s.replace(/postgresql:\/\/[^\s]+/g, '<redacted-url>');
}

function run(cmd, args, opts = {}) {
  console.log('[finalize-db] $', redact([cmd, ...args].join(' ')));
  execFileSync(cmd, args, { stdio: 'inherit', ...opts });
}

function genPassword() {
  return crypto.randomBytes(24).toString('base64').replace(/[^A-Za-z0-9]/g, '');
}

function roleUrl(baseUrl, role, password) {
  const u = new URL(baseUrl);
  u.username = role;
  u.password = password;
  return u.toString();
}

console.log('[finalize-db] Rotating role passwords...');
const appPw = genPassword();
const identityPw = genPassword();
const platformPw = genPassword();

const rotateSqlPath = path.join(os.tmpdir(), 'finalize-rotate.sql');
fs.writeFileSync(
  rotateSqlPath,
  [
    `ALTER ROLE chnnl_app WITH PASSWORD '${appPw}';`,
    `ALTER ROLE chnnl_identity WITH PASSWORD '${identityPw}';`,
    `ALTER ROLE chnnl_platform WITH PASSWORD '${platformPw}';`,
  ].join('\n'),
);
run('npx', ['prisma', 'db', 'execute', '--file', rotateSqlPath, '--url', ownerUrl]);
fs.unlinkSync(rotateSqlPath);

const appUrl = roleUrl(ownerUrl, 'chnnl_app', appPw);
const identityUrl = roleUrl(ownerUrl, 'chnnl_identity', identityPw);
const platformUrl = roleUrl(ownerUrl, 'chnnl_platform', platformPw);

console.log('[finalize-db] Creating platform staff accounts (if missing)...');
const platformStaffPassword = 'ChnnlPlatformStaff123!';
const passwordHash = bcrypt.hashSync(platformStaffPassword, 12);
const staffDefs = [
  { email: 'staff-super@chnnl.internal', name: 'Kate Sullivan', role: 'SUPER_ADMIN' },
  { email: 'staff-safety@chnnl.internal', name: 'Marcus Webb', role: 'SAFETY_OFFICER' },
  { email: 'staff-support@chnnl.internal', name: 'Amina Yusuf', role: 'SUPPORT' },
];
const esc = (v) => v.replace(/'/g, "''");
const staffSql = staffDefs
  .map((s) => {
    const id = crypto.randomUUID();
    return `INSERT INTO platform.platform_staff_accounts (id, email, name, "passwordHash", role, "updatedAt") VALUES ('${id}', '${esc(s.email)}', '${esc(s.name)}', '${esc(passwordHash)}', '${s.role}', CURRENT_TIMESTAMP) ON CONFLICT (email) DO NOTHING;`;
  })
  .join('\n');
const staffSqlPath = path.join(os.tmpdir(), 'finalize-staff.sql');
fs.writeFileSync(staffSqlPath, staffSql);
run('npx', ['prisma', 'db', 'execute', '--file', staffSqlPath, '--url', ownerUrl]);
fs.unlinkSync(staffSqlPath);

console.log('[finalize-db] Done. Set these as permanent Vercel project env vars:');
console.log('FINALIZE_RESULT_DATABASE_URL=' + appUrl);
console.log('FINALIZE_RESULT_IDENTITY_DATABASE_URL=' + identityUrl);
console.log('FINALIZE_RESULT_PLATFORM_DATABASE_URL=' + platformUrl);
