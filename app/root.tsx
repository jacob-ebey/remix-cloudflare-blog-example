import type { MetaFunction, LoaderFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { Link, Links, LiveReload, Meta, Outlet } from "@remix-run/react";

export const loader: LoaderFunction = async () => {
  let configResponse = await fetch(
    "https://github-md.com/jacob-ebey/remix-blog-example-content/main/config.md"
  );

  let { attributes, error, html } = await configResponse.json();
  if (error) {
    console.error(error);
    throw new Error(error);
  }

  return json({ attributes, html });
};

export const meta: MetaFunction = ({ data }) => {
  let { siteName, siteDescription } = data?.attributes || {};
  return {
    charset: "utf-8",
    title: siteName,
    description: siteDescription,
    viewport: "width=device-width,initial-scale=1",
  };
};

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
        <link
          rel="stylesheet"
          href="https://unpkg.com/@exampledev/new.css@1.1.3/new.css"
        />
      </head>
      <body>
        <header>
          <h1>Example Blog</h1>
          <nav>
            <Link to="/">Home</Link>
          </nav>
        </header>
        <Outlet />
        <LiveReload />
      </body>
    </html>
  );
}
