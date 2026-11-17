/**
 * Purge a pending/stuck Invite (and all its linked VerificationResults,
 * DeclarationApprovals, JoinRequests) for a user who never completed
 * registration — so they can be re-onboarded from scratch.
 *
 * Also clears any VerificationResult rows that hold the Aadhaar / PAN
 * hostage, even if they're on a *different* invite/user (eKYC Hub reuse).
 *
 * Usage:
 *   npx tsx scripts/purgeInviteByContact.ts --phone 9603216493               # dry-run
 *   npx tsx scripts/purgeInviteByContact.ts --phone 9603216493 --apply       # execute
 *   npx tsx scripts/purgeInviteByContact.ts --email kiran221979@gmail.com --apply
 *   npx tsx scripts/purgeInviteByContact.ts --aadhaar "4868 8015 7776" --apply
 */
import fs from "node:fs";
import path from "node:path";

function loadEnv(file: string) {
  const p = path.resolve(process.cwd(), file);
  if (!fs.existsSync(p)) return;
  for (const raw of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}
loadEnv(".env");
loadEnv(".env.local");

const args = process.argv.slice(2);
const APPLY = args.includes("--apply");

function getArg(flag: string): string | undefined {
  const idx = args.indexOf(flag);
  return idx !== -1 ? args[idx + 1] : undefined;
}

const phoneArg  = getArg("--phone");
const emailArg  = getArg("--email");
const aadhaarArg = getArg("--aadhaar");

async function main() {
  const { prisma } = await import("../src/lib/db");

  console.log(`\n=== INVITE PURGE — mode: ${APPLY ? "APPLY (WRITING)" : "DRY-RUN"} ===\n`);

  if (!phoneArg && !emailArg && !aadhaarArg) {
    console.error("Provide at least one of --phone, --email, or --aadhaar.");
    process.exit(1);
  }

  // ── 1. Find invites matching the given contact ──
  const inviteWhere: object[] = [];
  if (phoneArg) inviteWhere.push({ phone: phoneArg });
  if (emailArg) inviteWhere.push({ email: emailArg.toLowerCase() });

  const invites = inviteWhere.length
    ? await prisma.invite.findMany({
        where: { OR: inviteWhere },
        select: { id: true, email: true, phone: true, role: true, status: true, userId: true, name: true },
      })
    : [];

  console.log(`Found ${invites.length} invite(s) for the given contact:`);
  for (const i of invites) {
    console.log(`  • [${i.id}] ${i.name ?? "—"} — ${i.email} / ${i.phone}  role=${i.role}  status=${i.status}  userId=${i.userId ?? "none"}`);
  }

  // ── 2. Find VerificationResult rows that hold the Aadhaar hostage ──
  //    The Aadhaar check compares against the encrypted/hashed stored value
  //    OR searches by responsePayload JSON for the uid_token / aadhaar field.
  //    We fall back to a broad search by inviteId + type.
  const inviteIds = invites.map((i) => i.id);
  const userIds   = invites.map((i) => i.userId).filter(Boolean) as string[];

  // All verification results tied to these invites or users
  const verifByInvite = inviteIds.length
    ? await prisma.verificationResult.findMany({
        where: { inviteId: { in: inviteIds } },
        select: { id: true, type: true, status: true, orderid: true, inviteId: true, userId: true },
      })
    : [];

  const verifByUser = userIds.length
    ? await prisma.verificationResult.findMany({
        where: { userId: { in: userIds } },
        select: { id: true, type: true, status: true, orderid: true, inviteId: true, userId: true },
      })
    : [];

  // Also search for Aadhaar results that contain the given UID in their
  // responsePayload — this catches results tied to OTHER invites/users
  // that still mark this Aadhaar as "used".
  let verifByAadhaarPayload: { id: string; type: string; status: string; orderid: string; inviteId: string | null; userId: string | null }[] = [];
  const aadhaarDigits = (aadhaarArg ?? "").replace(/\s/g, "");
  if (aadhaarDigits.length === 12) {
    verifByAadhaarPayload = await prisma.$queryRaw<typeof verifByAadhaarPayload>`
      SELECT id, type, status, orderid, "inviteId", "userId"
      FROM "VerificationResult"
      WHERE type = 'AADHAAR_DIGILOCKER'
        AND (
          "responsePayload"::text ILIKE ${"%" + aadhaarDigits + "%"}
          OR "requestPayload"::text  ILIKE ${"%" + aadhaarDigits + "%"}
        )
    `;
  }

  // Also search by phone/email in request/response payloads of AADHAAR results
  const verifByPhone: typeof verifByAadhaarPayload = phoneArg
    ? await prisma.$queryRaw`
        SELECT id, type, status, orderid, "inviteId", "userId"
        FROM "VerificationResult"
        WHERE type IN ('AADHAAR_DIGILOCKER', 'PAN_360')
          AND (
            "responsePayload"::text ILIKE ${"%" + phoneArg + "%"}
            OR "requestPayload"::text  ILIKE ${"%" + phoneArg + "%"}
          )
      `
    : [];

  const allVerifIds = new Set([
    ...verifByInvite.map(v => v.id),
    ...verifByUser.map(v => v.id),
    ...verifByAadhaarPayload.map(v => v.id),
    ...verifByPhone.map(v => v.id),
  ]);

  console.log(`\nVerificationResult rows to delete: ${allVerifIds.size}`);
  if (verifByInvite.length)         console.log(`  → by inviteId          : ${verifByInvite.length}`);
  if (verifByUser.length)           console.log(`  → by userId            : ${verifByUser.length}`);
  if (verifByAadhaarPayload.length) console.log(`  → by Aadhaar payload   : ${verifByAadhaarPayload.length}`);
  if (verifByPhone.length)          console.log(`  → by phone in payload  : ${verifByPhone.length}`);

  // ── 3. DeclarationApprovals tied to these invites ──
  const declCount = inviteIds.length
    ? await prisma.declarationApproval.count({ where: { inviteId: { in: inviteIds } } })
    : 0;
  console.log(`DeclarationApproval rows to delete : ${declCount}`);

  // ── 4. JoinRequests for the same contact ──
  const joinWhere: object[] = [];
  if (phoneArg) joinWhere.push({ phone: phoneArg });
  if (emailArg) joinWhere.push({ email: emailArg.toLowerCase() });
  const joinCount = joinWhere.length
    ? await prisma.joinRequest.count({ where: { OR: joinWhere } })
    : 0;
  console.log(`JoinRequest rows to delete         : ${joinCount}`);

  // ── 5. OTP / LoginAttempt cleanup ──
  const otpTargets: string[] = [];
  if (phoneArg) otpTargets.push(phoneArg);
  if (emailArg) otpTargets.push(emailArg.toLowerCase());
  const otpCount = otpTargets.length
    ? await prisma.otp.count({ where: { target: { in: otpTargets } } })
    : 0;
  console.log(`Otp rows to delete                 : ${otpCount}`);

  if (!APPLY) {
    console.log("\nDRY-RUN — nothing written. Re-run with --apply to execute.\n");
    await prisma.$disconnect();
    return;
  }

  // ── APPLY: delete in safe order ──
  console.log("\n[1/5] Deleting DeclarationApprovals…");
  if (inviteIds.length && declCount > 0) {
    const r = await prisma.declarationApproval.deleteMany({ where: { inviteId: { in: inviteIds } } });
    console.log(`  ✓ ${r.count} deleted`);
  } else {
    console.log("  — skipped (none)");
  }

  console.log("[2/5] Deleting VerificationResults…");
  if (allVerifIds.size > 0) {
    const r = await prisma.verificationResult.deleteMany({ where: { id: { in: [...allVerifIds] } } });
    console.log(`  ✓ ${r.count} deleted`);
  } else {
    console.log("  — skipped (none)");
  }

  console.log("[3/5] Deleting Invites…");
  if (inviteIds.length) {
    const r = await prisma.invite.deleteMany({ where: { id: { in: inviteIds } } });
    console.log(`  ✓ ${r.count} deleted`);
  } else {
    console.log("  — skipped (none)");
  }

  console.log("[4/5] Deleting JoinRequests…");
  if (joinWhere.length && joinCount > 0) {
    const r = await prisma.joinRequest.deleteMany({ where: { OR: joinWhere } });
    console.log(`  ✓ ${r.count} deleted`);
  } else {
    console.log("  — skipped (none)");
  }

  console.log("[5/5] Deleting OTPs…");
  if (otpTargets.length && otpCount > 0) {
    const r = await prisma.otp.deleteMany({ where: { target: { in: otpTargets } } });
    console.log(`  ✓ ${r.count} deleted`);
  } else {
    console.log("  — skipped (none)");
  }

  // ── Verification: identity slots freed ──
  console.log("\n=== POST-CHECK ===");
  const inviteStillThere = await prisma.invite.count({ where: { OR: inviteWhere } });
  console.log(`Invite rows remaining for contact  : ${inviteStillThere === 0 ? "0 ✓" : inviteStillThere + " ✗"}`);

  if (aadhaarDigits.length === 12) {
    const aadhaarStillLinked = await prisma.$queryRaw<{ count: number }[]>`
      SELECT COUNT(*)::int AS count FROM "VerificationResult"
      WHERE type = 'AADHAAR_DIGILOCKER'
        AND (
          "responsePayload"::text ILIKE ${"%" + aadhaarDigits + "%"}
          OR "requestPayload"::text  ILIKE ${"%" + aadhaarDigits + "%"}
        )
    `;
    const c = aadhaarStillLinked[0]?.count ?? 0;
    console.log(`Aadhaar still in VerifResult       : ${c === 0 ? "0 ✓ (free)" : c + " ✗ (still linked)"}`);
  }

  console.log("\n✓ Purge complete — the user can now be re-onboarded with the same contact details.\n");
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error("\nFATAL:", e);
  process.exit(1);
});
