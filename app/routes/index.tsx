import { json } from "@remix-run/cloudflare";

import type { GithubMdResponse, LoaderFunction } from "~/types";

import CatchAll, { meta } from "./$";
import type { LoaderData } from "./$";

export { meta };
export default CatchAll;

export let loader: LoaderFunction = async ({ context: { ctx }, request }) => {
  let url = new URL(request.url);
  let sha = url.searchParams.get("sha")?.trim() || "main";

  let [markdownResponse, pageViewsResponse] = await Promise.all([
    fetch(
      `https://github-md.com/jacob-ebey/remix-blog-example-content/${sha}/routes/index.md`
    ),
    fetch(`https://api.countapi.xyz/get/remix-blog-example/index--${sha}`),
  ]);
  let markdown = await markdownResponse.json<
    GithubMdResponse<{ title?: string; description?: string }>
  >();
  if ("error" in markdown) {
    console.error(markdown.error);
    throw json(null, { status: markdownResponse.status });
  }

  let pageViews = await pageViewsResponse
    .json<{ value: number | null }>()
    .then((json) => json?.value || 0)
    .catch(() => 0);
  let pageView = pageViews + 1;

  ctx.waitUntil(
    fetch(`https://api.countapi.xyz/hit/remix-blog-example/index--${sha}`)
  );

  return json<LoaderData>({
    html: markdown.html,
    attributes: {
      description: markdown.attributes.description,
      title: markdown.attributes.title,
    },
    pageView,
  });
};
