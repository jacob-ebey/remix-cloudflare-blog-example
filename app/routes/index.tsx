import { json } from "@remix-run/cloudflare";

import type { GithubMdResponse, LoaderFunction } from "~/types";

import CatchAll from "./$";
import type { LoaderData } from "./$";

export default CatchAll;

export let loader: LoaderFunction = async ({ request }) => {
  let url = new URL(request.url);
  let sha = url.searchParams.get("sha")?.trim() || "main";

  let markdownResponse = await fetch(
    `https://github-md.com/jacob-ebey/remix-blog-example-content/${sha}/routes/index.md`
  );
  let markdown = (await markdownResponse.json()) as GithubMdResponse<{
    title?: string;
    description?: string;
  }>;
  if ("error" in markdown) {
    console.error(markdown.error);
    throw json(null, { status: markdownResponse.status });
  }

  return json<LoaderData>({
    html: markdown.html,
    attributes: {},
    pageViewId: `jacob-ebey/remix-blog-example--index--${sha}`,
  });
};
