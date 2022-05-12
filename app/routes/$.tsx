import type { MetaFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";

import type { GithubMdResponse, LoaderFunction } from "~/types";

export type LoaderData = {
  html: string;
  attributes: { title?: string; description?: string };
  pageView: number;
};

export let loader: LoaderFunction = async ({
  context: { ctx },
  params,
  request,
}) => {
  let url = new URL(request.url);
  let sha = url.searchParams.get("sha")?.trim() || "main";
  let [markdownResponse, pageViewsResponse] = await Promise.all([
    fetch(
      `https://github-md.com/jacob-ebey/remix-blog-example-content/${sha}/routes/${params["*"]}.md`
    ),
    fetch(
      `https://api.countapi.xyz/get/remix-blog-example/${
        params["*"]?.replace(/\//, "--") || "unknown"
      }--${sha}`
    ),
  ]);
  let markdown = await markdownResponse.json<
    GithubMdResponse<{ title?: string; description?: string }>
  >();
  if ("error" in markdown) {
    throw json(null, { status: markdownResponse.status });
  }

  let pageViews = await pageViewsResponse
    .json<{ value: number | null }>()
    .then((json) => json?.value || 0)
    .catch(() => 0);
  let pageView = pageViews + 1;

  ctx.waitUntil(
    fetch(
      `https://api.countapi.xyz/hit/remix-blog-example/${
        params["*"]?.replace(/\//, "--") || "unknown"
      }--${sha}`
    )
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

export const meta: MetaFunction = ({ data }: { data?: LoaderData }) => {
  let { title, description } = data?.attributes || {};
  return {
    charset: "utf-8",
    title,
    description,
    viewport: "width=device-width,initial-scale=1",
  };
};

export default function CatchAll() {
  let { html, pageView } = useLoaderData() as LoaderData;

  return (
    <main>
      <article dangerouslySetInnerHTML={{ __html: html }} />
      <footer>
        <p>Page View: {pageView}</p>
      </footer>
    </main>
  );
}
