import type { DataFunctionArgs as BaseDataFunctionArgs } from "@remix-run/cloudflare";

export type Env = {
  GITHUB_USERNAME?: string;
  GITHUB_REPOSITORY?: string;
};

export type DataFunctionContext = {
  ctx: EventContext<Env, string, unknown>;
};

export type DataFunctionArgs = Omit<BaseDataFunctionArgs, "context"> & {
  context: DataFunctionContext;
};

export type ActionFunction = (
  args: DataFunctionArgs
) => Promise<Response> | Response;

export type LoaderFunction = (
  args: DataFunctionArgs
) => Promise<Response> | Response;

// API TYPES ///////////////////////////////////////////////////////////////////

export type GithubMdErrorResponse = {
  error: string;
};

export type GithubMdResponse<Attributes = unknown> =
  | GithubMdErrorResponse
  | {
      attributes: Attributes;
      html: string;
      staleAt: number;
    };

export type GithubMdListResponse =
  | GithubMdErrorResponse
  | {
      sha: string;
      files: { path: string; sha: string }[];
      staleAt: number;
    };
