import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
  "host",
  "content-length",
]);

const getBaseServerUrl = (): string => {
  const value = process.env.SERVER_URL;
  if (!value) {
    throw new Error("SERVER_URL is not configured.");
  }
  return value.replace(/\/+$/, "");
};

const normalizeProxyPath = (baseUrl: string, path: string[]): string => {
  const joinedPath = path.join("/");
  const parsedBaseUrl = new URL(baseUrl);
  const normalizedBasePath = parsedBaseUrl.pathname.replace(/\/+$/, "");

  // Support both SERVER_URL=http://host and SERVER_URL=http://host/api.
  if (normalizedBasePath.endsWith("/api")) {
    if (joinedPath === "api") {
      return "";
    }
    if (joinedPath.startsWith("api/")) {
      return joinedPath.slice(4);
    }
  }

  return joinedPath;
};

const forward = async (
  request: NextRequest,
  path: string[],
): Promise<NextResponse> => {
  let baseUrl: string;

  try {
    baseUrl = getBaseServerUrl();
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "SERVER_URL is missing.",
      },
      { status: 500 },
    );
  }

  const targetPath = normalizeProxyPath(baseUrl, path);
  const targetUrl = new URL(`${baseUrl}/${targetPath}`);

  request.nextUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.append(key, value);
  });

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  const method = request.method.toUpperCase();
  const body =
    method === "GET" || method === "HEAD"
      ? undefined
      : await request.arrayBuffer();

  const upstreamResponse = await fetch(targetUrl, {
    method,
    headers,
    body,
    redirect: "manual",
    cache: "no-store",
  });

  const responseHeaders = new Headers();
  upstreamResponse.headers.forEach((value, key) => {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      responseHeaders.set(key, value);
    }
  });

  return new NextResponse(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: responseHeaders,
  });
};

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

export async function GET(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  const { path } = await context.params;
  return forward(request, path);
}

export async function POST(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  const { path } = await context.params;
  return forward(request, path);
}

export async function PUT(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  const { path } = await context.params;
  return forward(request, path);
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  const { path } = await context.params;
  return forward(request, path);
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  const { path } = await context.params;
  return forward(request, path);
}
