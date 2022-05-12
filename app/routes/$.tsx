import type { MetaFunction, LoaderFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";

type LoaderData = {
  html: string;
  attributes: { title?: string; description?: string };
};

export let loader: LoaderFunction = async ({ params }) => {
  let markdownResponse = await fetch(
    `https://github-md.com/jacob-ebey/remix-blog-example-content/main/routes/${params["*"]}.md`
  );
  let markdown = await markdownResponse.json<
    | { attributes: { title?: string; description?: string }; html: string }
    | { error: string }
  >();
  if ("error" in markdown) {
    throw json(null, { status: 404 });
  }

  return json<LoaderData>({
    html: markdown.html,
    attributes: markdown.attributes,
  });
};

export const meta: MetaFunction = ({ data }) => {
  let { title, description } = data?.attributes || {};
  return {
    charset: "utf-8",
    title,
    description,
    viewport: "width=device-width,initial-scale=1",
  };
};

export default function CatchAll() {
  let { html } = useLoaderData() as LoaderData;

  return (
    <main>
      <article dangerouslySetInnerHTML={{ __html: html }} />
    </main>
  );
}
