import type { ReactNode } from "react";
import type { MetaFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  useCatch,
  useMatches,
} from "@remix-run/react";

import type { GithubMdResponse, LoaderFunction } from "./types";

type LoaderData = {
  attributes: {
    siteName?: string;
    siteDescription?: string;
  };
};

export const loader: LoaderFunction = async () => {
  let configResponse = await fetch(
    "https://github-md.com/jacob-ebey/remix-blog-example-content/main/config.md"
  );

  let markdown = await configResponse.json<
    GithubMdResponse<{ siteName?: string; siteDescription?: string }>
  >();
  if ("error" in markdown) {
    console.error(markdown.error);
    throw new Error(markdown.error);
  }

  return json<LoaderData>({
    attributes: {
      siteName: markdown.attributes.siteName,
      siteDescription: markdown.attributes.siteDescription,
    },
  });
};

export const meta: MetaFunction = ({ data }: { data?: LoaderData }) => {
  let { siteName, siteDescription } = data?.attributes || {};
  return {
    charset: "utf-8",
    title: siteName,
    description: siteDescription,
    viewport: "width=device-width,initial-scale=1",
  };
};

function Document({ children }: { children: ReactNode }) {
  let data = useMatches().find((match) => match.id === "root")?.data as
    | LoaderData
    | undefined;

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
          {data?.attributes.siteName && <h1>{data.attributes.siteName}</h1>}
          <nav>
            <Link to="/">Home</Link>
          </nav>
        </header>
        {children}
        <LiveReload />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <Document>
      <Outlet />
      <LiveReload />
    </Document>
  );
}

export function CatchBoundary() {
  let caught = useCatch();

  return (
    <Document>
      <main>
        <h1>
          {caught.status} {caught.statusText}
        </h1>
        <p>
          Try reloading the page or heading back <Link to="/">home</Link>.
        </p>
      </main>
    </Document>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return (
    <Document>
      <main>
        <h1>Oops, looks like something went wrong.</h1>
        <p>
          Try reloading the page or heading back <Link to="/">home</Link>.
        </p>
      </main>
    </Document>
  );
}
