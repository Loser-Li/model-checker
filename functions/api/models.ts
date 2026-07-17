import { getProvider } from "../../src/lib/providers";
import type { Provider } from "../../src/types";
import type { AppFunction } from "../_lib/env";
import { json, messageFromError, readJson } from "../_lib/http";

interface ModelsBody {
  baseUrl?: string;
  apiKey?: string;
  provider?: Provider;
}

export const onRequestPost: AppFunction = async ({ request }) => {
  const body = await readJson<ModelsBody>(request);
  const provider = body.provider || "openai";
  if (provider === "openai" && !body.baseUrl) return json({ error: "缺少 baseUrl" }, 400);
  if (!body.apiKey) return json({ error: "缺少 apiKey" }, 400);

  try {
    const models = await getProvider(provider).fetchModels(body.baseUrl || "", body.apiKey);
    return json({
      object: "list",
      data: models.map((model) => ({
        id: model.id,
        object: "model",
        owned_by: provider,
        display_name: model.displayName,
      })),
    });
  } catch (error) {
    return json({ error: messageFromError(error) }, 502);
  }
};
