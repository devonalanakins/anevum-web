/**
 * ANEVUM Open Institute: read-only Cloudflare preview diagnostic.
 *
 * No Cloudflare writes, deployments, DNS changes, auth changes or GitHub variable
 * changes. Does not replace the existing original-works hosted preflight.
 * A passing diagnostic NEVER implies publication, release approval or iOS acceptance.
 */
import {fileURLToPath} from "node:url";
import {resolve} from "node:path";
import {checkAccessPreviewGate} from "../verify-original-works-hosted-access.mjs";

const SCRIPT = "anevum-web-nextgen";
const HEX32 = /^[a-f0-9]{32}$/i;
const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
export const REPORT_FORMAT = "anevum-institute-preview-readiness/v1";

function workerList(value) {
  return Array.isArray(value) ? value : value && Array.isArray(value.items) ? value.items : null;
}
function matchingApps(apps,tag) {
  return apps.filter(app => Array.isArray(app?.destinations) &&
    app.destinations.some(d => d?.type === "preview_worker" && d.worker_id === tag));
}
function blocked(blockers) {
  return {
    format: REPORT_FORMAT,
    target: SCRIPT,
    readyForProtectedReview: blockers.length === 0,
    blockedBy: [...new Set(blockers)],
    changesMade: false,
    releaseApproved: false,
    realDeviceVerified: false
  };
}
/** Pure, fail-closed classifier. No raw IDs, emails, tokens or policy objects returned. */
export function assessInstitutePreviewReadiness({
  workers, subdomain, accessApps, policies, pinnedAppId="", pinnedWorkerTag=""
} = {}) {
  const blockers = [];
  const list = workerList(workers);
  const target = list?.find(w => w?.id === SCRIPT);
  const tag = target?.tag;
  if (!HEX32.test(tag || "")) blockers.push("TARGET_WORKER_UNVERIFIED");
  if (subdomain?.previews_enabled !== true) blockers.push("WORKER_PREVIEWS_DISABLED");
  if (!Array.isArray(accessApps)) blockers.push("ACCESS_INVENTORY_UNAVAILABLE");
  const matches = HEX32.test(tag || "") && Array.isArray(accessApps) ? matchingApps(accessApps,tag) : [];
  if (Array.isArray(accessApps) && HEX32.test(tag || "")) {
    if (matches.length === 0) blockers.push("OWNER_ONLY_PREVIEW_APP_MISSING");
    if (matches.length > 1) blockers.push("MULTIPLE_PREVIEW_APPS_FOR_TARGET");
  }
  if (!UUID.test(pinnedAppId)) blockers.push("PINNED_ACCESS_APP_ID_MISSING");
  if (!HEX32.test(pinnedWorkerTag)) blockers.push("PINNED_WORKER_TAG_MISSING");
  if (HEX32.test(tag || "") && HEX32.test(pinnedWorkerTag) && pinnedWorkerTag !== tag) {
    blockers.push("PINNED_WORKER_TAG_MISMATCH");
  }
  if (matches.length === 1) {
    const app = matches[0];
    if (UUID.test(pinnedAppId) && pinnedAppId !== app.id) blockers.push("PINNED_ACCESS_APP_MISMATCH");
    if (!Array.isArray(policies)) blockers.push("OWNER_POLICY_UNVERIFIED");
    if (UUID.test(pinnedAppId) && HEX32.test(pinnedWorkerTag) && Array.isArray(policies)) {
      blockers.push(...checkAccessPreviewGate({
        subdomain, app, policies,
        pinnedAppId, pinnedWorkerUuid:pinnedWorkerTag, actualWorkerUuid:tag
      }));
    }
  }
  return blocked(blockers);
}

/**
 * Reads ONLY existing Cloudflare resources. Callers provide credentials in memory;
 * no account ID, worker tag, Access ID, policy body or token is logged.
 */
export async function readInstitutePreviewSnapshot({token,accountId,fetchImpl=fetch}={}) {
  if (typeof token !== "string" || token.length < 1 || !HEX32.test(accountId || "")) {
    throw new Error("READONLY_CREDENTIALS_MISSING_OR_INVALID");
  }
  const root = "https://api.cloudflare.com/client/v4/accounts/" + accountId;
  async function read(path) {
    const response=await fetchImpl(root+path,{
      method:"GET",redirect:"error",
      headers:{Authorization:"Bearer "+token,Accept:"application/json"}
    });
    if (!response.ok) throw new Error("CLOUDFLARE_READ_DENIED_OR_UNAVAILABLE");
    const data=await response.json();
    if (data?.success !== true) throw new Error("CLOUDFLARE_READ_DENIED_OR_UNAVAILABLE");
    return data;
  }
  const [workerData,subdomainData,accessData]=await Promise.all([
    read("/workers/scripts?per_page=200"),
    read("/workers/scripts/"+SCRIPT+"/subdomain"),
    read("/access/apps?page=1&per_page=100")
  ]);
  // A partial inventory is never evidence that a target, competing Access app, or policy is absent.
  function assertOnePage(payload,label) {
    const pages=payload?.result_info?.total_pages;
    if (pages !== undefined && (!Number.isInteger(pages) || pages !== 1)) {
      throw new Error(label+"_PAGINATION_UNVERIFIED");
    }
  }
  assertOnePage(workerData,"WORKER_INVENTORY");
  assertOnePage(accessData,"ACCESS_INVENTORY");
  const workers=workerList(workerData.result);
  const apps=workerList(accessData.result);
  if (!workers || !apps) throw new Error("CLOUDFLARE_INVENTORY_UNAVAILABLE");
  const target=workers.find(w=>w?.id===SCRIPT);
  const matches=HEX32.test(target?.tag || "")?matchingApps(apps,target.tag):[];
  let policies=null;
  if (matches.length === 1 && UUID.test(matches[0]?.id || "")) {
    const policiesData=await read("/access/apps/"+matches[0].id+"/policies");
    assertOnePage(policiesData,"ACCESS_POLICY_INVENTORY");
    policies=workerList(policiesData.result);
  }
  return {workers,subdomain:subdomainData.result,accessApps:apps,policies};
}

async function main() {
  if (!process.argv.includes("--read-only")) {
    console.error("Use --read-only to inspect existing Cloudflare configuration without writes.");
    process.exitCode=2;return;
  }
  try {
    const remote=await readInstitutePreviewSnapshot({
      token:process.env.CLOUDFLARE_API_TOKEN,accountId:process.env.CLOUDFLARE_ACCOUNT_ID
    });
    const result=assessInstitutePreviewReadiness({
      ...remote,
      pinnedAppId:process.env.ANEVUM_WEB_PREVIEW_ACCESS_APP_ID || "",
      pinnedWorkerTag:process.env.ANEVUM_WEB_PREVIEW_WORKER_UUID || ""
    });
    console.log(JSON.stringify(result));
    if (!result.readyForProtectedReview) process.exitCode=1;
  } catch (error) {
    const known=new Set([
      "READONLY_CREDENTIALS_MISSING_OR_INVALID",
      "CLOUDFLARE_READ_DENIED_OR_UNAVAILABLE",
      "ACCESS_INVENTORY_PAGINATION_UNVERIFIED",
      "WORKER_INVENTORY_PAGINATION_UNVERIFIED",
      "ACCESS_POLICY_INVENTORY_PAGINATION_UNVERIFIED",
      "CLOUDFLARE_INVENTORY_UNAVAILABLE"
    ]);
    const code=known.has(error?.message)?error.message:"READONLY_DIAGNOSTIC_FAILED";
    console.log(JSON.stringify(blocked([code])));
    process.exitCode=1;
  }
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
