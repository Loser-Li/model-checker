import { getProvider } from "../../src/lib/providers";
import type { Provider } from "../../src/types";
import type { AppFunction } from "../_lib/env";
import { json, messageFromError, readJson } from "../_lib/http";

interface TestBody {
  baseUrl?: string;
  apiKey?: string;
  modelId?: string;
  provider?: Provider;
}

export const onRequestPost: AppFunction = async ({ request }) => {
  const body = await readJson<TestBody>(request);
  const provider = body.provider || "openai";
  if (provider === "openai" && !body.baseUrl) return json({ error: "缺少 baseUrl" }, 400);
  if (!body.apiKey || !body.modelId) return json({ error: "缺少 apiKey 或 modelId" }, 400);

  try {
    const result = await getProvider(provider).testModel(
      body.baseUrl || "",
      body.apiKey,
      body.modelId
    );
    return json(result);
  } catch (error) {
    return json({ success: false, latency: 0, error: messageFromError(error) });
  }
};
