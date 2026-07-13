import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://moucddbkmdishpyyuylt.supabase.co";
const publishableKey = "sb_publishable_V8dFweUgt3E6G4hKhYfn5g_EN6kxia_";
const apiBase = "https://sipnotes-api.vercel.app/api/mobile";
const secretKey = process.env.SUPABASE_SECRET;

if (!/^sb_secret_[A-Za-z0-9_-]+$/.test(secretKey ?? "")) {
  throw new Error("SUPABASE_SECRET must contain the server-side Supabase secret key");
}

const clientOptions = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
};

const admin = createClient(supabaseUrl, secretKey, clientOptions);
const email = `sipnotes-e2e-${Date.now()}@example.com`;
const password = `E2e-${crypto.randomUUID()}-Aa1!`;
const evidence = {};
let userId;
let deletedByApi = false;

async function fetchWithRetry(url, init, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fetch(url, init);
    } catch (error) {
      lastError = error;
      if (attempt === attempts) break;
      await new Promise((resolve) => setTimeout(resolve, attempt * 300));
    }
  }
  throw lastError;
}

async function api(path, token, init = {}, expected = [200]) {
  const headers = new Headers(init.headers || {});
  headers.set("authorization", `Bearer ${token}`);
  if (init.body && !(init.body instanceof FormData)) {
    headers.set("content-type", "application/json");
  }

  const response = await fetchWithRetry(`${apiBase}${path}`, { ...init, headers });
  const payload = await response.json().catch(() => null);
  if (!expected.includes(response.status)) {
    throw new Error(`${path} returned ${response.status}: ${JSON.stringify(payload)}`);
  }
  if (!payload?.success) throw new Error(`${path} returned unsuccessful payload`);
  return { status: response.status, data: payload.data };
}

try {
  const created = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (created.error || !created.data.user) {
    throw created.error || new Error("User creation failed");
  }
  userId = created.data.user.id;
  evidence.authUserCreated = true;

  const client = createClient(supabaseUrl, publishableKey, clientOptions);
  const signedIn = await client.auth.signInWithPassword({ email, password });
  if (signedIn.error || !signedIn.data.session) {
    throw signedIn.error || new Error("Sign-in failed");
  }
  const token = signedIn.data.session.access_token;
  evidence.passwordSignIn = true;

  const locations = await api("/locations", token);
  if (!Array.isArray(locations.data) || locations.data.length !== 30) {
    throw new Error("Expected 30 cities");
  }
  const city = locations.data[0];
  const region = city.regions?.[0];
  if (!city?.id || !region?.id) throw new Error("Location seed missing city or region");
  evidence.locationCount = locations.data.length;

  const draft = await api(
    "/drafts",
    token,
    {
      method: "POST",
      body: JSON.stringify({ localClientId: `e2e-${Date.now()}`, draftPayload: {} }),
    },
    [201],
  );
  if (!draft.data?.id) throw new Error("Draft id missing");
  const draftId = draft.data.id;
  evidence.draftCreated = true;

  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9ZP0sAAAAASUVORK5CYII=",
    "base64",
  );
  const form = new FormData();
  form.append("file", new File([png], "e2e.png", { type: "image/png" }));
  const uploaded = await api(`/drafts/${draftId}/image`, token, {
    method: "POST",
    body: form,
  });
  if (!uploaded.data?.image_url || uploaded.data.image_upload_status !== "ready") {
    throw new Error("Image upload not ready");
  }
  const signedImage = await fetchWithRetry(uploaded.data.image_url);
  if (!signedImage.ok) throw new Error(`Signed image returned ${signedImage.status}`);
  evidence.imageUploadedAndSigned = true;

  let current = uploaded.data;
  for (let attempt = 0; attempt < 15 && current.recognition_status === "recognizing"; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    current = (await api(`/drafts/${draftId}`, token)).data;
  }
  if (current.recognition_status !== "ready") {
    throw new Error(`Recognition status ${current.recognition_status}`);
  }
  evidence.recognitionReady = true;

  const published = await api(
    "/checkins",
    token,
    {
      method: "POST",
      body: JSON.stringify({
        draftId,
        drinkName: "E2E Coffee",
        brandName: "SipNotes QA",
        storeName: "Cloud Test",
        category: "coffee",
        flavorTags: ["test"],
        cityId: city.id,
        regionId: region.id,
        caption: "initial launch verification",
        visibility: "private",
        consumedOn: new Date().toISOString().slice(0, 10),
      }),
    },
    [201],
  );
  if (!published.data?.id || !published.data?.image_url) {
    throw new Error("Published check-in missing data");
  }
  evidence.checkinPublished = true;

  const mine = await api("/checkins?scope=mine", token);
  if (!mine.data.some((row) => row.id === published.data.id)) {
    throw new Error("Published check-in not returned");
  }
  evidence.checkinReadable = true;

  const row = await admin
    .from("checkins")
    .select("id,image_path")
    .eq("id", published.data.id)
    .single();
  if (row.error || !row.data?.image_path) {
    throw row.error || new Error("Postgres check-in verification failed");
  }
  const folder = row.data.image_path.split("/").slice(0, 2).join("/");
  const objects = await admin.storage.from("drink-images").list(folder, { limit: 20 });
  if (objects.error || !objects.data?.length) {
    throw objects.error || new Error("Storage object verification failed");
  }
  evidence.postgresAndStorageVerified = true;

  const accountDelete = await api("/account/delete", token, { method: "POST" });
  if (accountDelete.data?.deleted !== true) throw new Error("Account delete response invalid");
  deletedByApi = true;
  evidence.accountDeleted = true;

  const lookup = await admin.auth.admin.getUserById(userId);
  if (!lookup.error && lookup.data.user) {
    throw new Error("Auth user still exists after account deletion");
  }
  const remainingObjects = await admin.storage.from("drink-images").list(folder, { limit: 20 });
  if (remainingObjects.error) throw remainingObjects.error;
  if (remainingObjects.data?.length) throw new Error("Storage object remains after account deletion");
  evidence.cleanupVerified = true;

  console.log(JSON.stringify(evidence));
} finally {
  if (userId && !deletedByApi) {
    await admin.auth.admin.deleteUser(userId, false).catch(() => undefined);
  }
}
