import type { AppFunction } from "../../../_lib/env";
import { beginOAuth } from "../../../_lib/oauth-flow";

export const onRequestGet: AppFunction = async ({ env, request }) =>
  beginOAuth(env, request, "github");
