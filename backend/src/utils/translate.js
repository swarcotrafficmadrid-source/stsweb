import { TranslationServiceClient } from "@google-cloud/translate";

function parseServiceAccount() {
  const raw = process.env.TRANSLATE_SERVICE_ACCOUNT_JSON || process.env.GMAIL_SERVICE_ACCOUNT_JSON || "";
  if (!raw) {
    return null;
  }
  try {
    if (raw.trim().startsWith("{")) {
      return JSON.parse(raw);
    }
    const decoded = Buffer.from(raw, "base64").toString("utf8");
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function getTranslationClient() {
  const creds = parseServiceAccount();
  if (!creds) {
    return null;
  }
  const projectId = process.env.TRANSLATE_PROJECT_ID || creds.project_id;
  if (!projectId) {
    return null;
  }
  return new TranslationServiceClient({
    projectId,
    credentials: {
      client_email: creds.client_email,
      private_key: creds.private_key
    }
  });
}

export async function translateTexts({ source, target, texts }) {
  const client = getTranslationClient();
  if (!client) {
    return null;
  }

  const projectId = process.env.TRANSLATE_PROJECT_ID;
  const request = {
    parent: `projects/${projectId}/locations/global`,
    contents: texts,
    mimeType: "text/plain",
    sourceLanguageCode: source,
    targetLanguageCode: target
  };

  const [response] = await client.translateText(request);
  return response.translations?.map((t) => t.translatedText) || null;
}
