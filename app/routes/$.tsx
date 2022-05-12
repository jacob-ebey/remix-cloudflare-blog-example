import type { MetaFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";

import type { GithubMdResponse, LoaderFunction } from "~/types";
import { js } from "~/utils";

export type LoaderData = {
  html: string;
  attributes: { title?: string; description?: string };
  pageViewId: string;
};

export let loader: LoaderFunction = async ({
  context: { ctx },
  params,
  request,
}) => {
  let username = ctx.env.GITHUB_USERNAME;
  let repository = ctx.env.GITHUB_REPOSITORY;

  if (!username || !repository) {
    throw new Error("Github username and repository are required");
  }

  let url = new URL(request.url);
  let sha = url.searchParams.get("sha")?.trim() || "main";
  let markdownResponse = await fetch(
    `https://github-md.com/${username}/${repository}/${sha}/routes/${params["*"]}.md`
  );
  let markdown = (await markdownResponse.json()) as GithubMdResponse<{
    title?: string;
    description?: string;
  }>;
  if ("error" in markdown) {
    throw json(null, { status: markdownResponse.status });
  }

  return json<LoaderData>({
    html: markdown.html,
    attributes: {
      description: markdown.attributes.description,
      title: markdown.attributes.title,
    },
    pageViewId: `${username}/${repository}--${
      params["*"]?.replace(/\//, "--") || "unknown"
    }--${sha}`,
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
  let { html, pageViewId } = useLoaderData() as LoaderData;

  let countApiUrl = `https://api.countapi.xyz/hit/${pageViewId}?callback=handlePageView`;

  return (
    <main>
      <article dangerouslySetInnerHTML={{ __html: html }} />
      <footer>
        <p>
          Page View: <span id="page-view" />
          <script
            async
            type="module"
            dangerouslySetInnerHTML={{
              __html: js`
                window.handlePageView = ({ value }) => {
                  console.log({ value });
                  if (value) {
                    document.getElementById("page-view").innerText = String(value);
                  }
                };

                import(${JSON.stringify(countApiUrl)}).catch(console.error);
              `,
            }}
          />
        </p>
      </footer>
    </main>
  );
}
