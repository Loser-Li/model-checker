import type { AppFunction } from "../../../_lib/env";
import { finishOAuth } from "../../../_lib/oauth-flow";

export const onRequestGet: AppFunction = async ({ env, request }) =>
  finishOAuth(env, request, "linuxdo");
