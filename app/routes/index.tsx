import { renderToStaticMarkup } from "react-dom/server";
import type { LoaderFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";

type LoaderData = {
  html: string;
};

export let loader: LoaderFunction = async () => {
  let [markdownResponse, filesResponse] = await Promise.all([
    fetch(
      "https://github-md.com/jacob-ebey/remix-blog-example-content/main/routes/index.md"
    ),
    fetch("https://github-md.com/jacob-ebey/remix-blog-example-content/main"),
  ]);
  let markdown = await markdownResponse.json<
    { attributes: unknown; html: string } | { error: string }
  >();
  if ("error" in markdown) {
    console.error(markdown.error);
    throw new Error(markdown.error);
  }

  let files = await filesResponse.json<
    { files: { path: string; sha: string }[] } | { error: string }
  >();
  if ("error" in files) {
    console.error(files.error);
    throw new Error(files.error);
  }

  let firstFewPosts = await Promise.all(
    files.files
      .filter((file) => file.path.startsWith("routes/blog/"))
      .slice(0, 20)
      .map(async (file) =>
        fetch(
          `https://github-md.com/jacob-ebey/remix-blog-example-content/main/${file.path}`
        )
          .then((res) =>
            res.json<
              | { attributes: { title?: string; description?: string } }
              | { error: string }
            >()
          )
          .then((json) =>
            "error" in json
              ? ""
              : renderToStaticMarkup(
                  <li>
                    <a
                      href={file.path
                        .replace("routes/", "/")
                        .replace(/\.md$/, "")}
                    >
                      {json.attributes.title ||
                        file.path.split(/[/\\]/g).pop()?.replace(/\.md$/, "") ||
                        file.path}
                    </a>
                  </li>
                )
          )
      )
  );

  let html = markdown.html.replace(
    "{{latestPosts}}",
    `<ul>${firstFewPosts.join("")}</ul>`
  );

  return json({
    html,
  });
};

export default function Index() {
  let { html } = useLoaderData() as LoaderData;

  return (
    <main>
      <article dangerouslySetInnerHTML={{ __html: html }} />
    </main>
  );
}
