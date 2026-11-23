import { NextResponse, type NextRequest } from "next/server";
import { resolveApiUrl } from "@/lib/api";

const allowedQueryKeys = new Set([
  "q",
  "category",
  "location",
  "sort",
  "page",
  "limit",
]);

export async function GET(request: NextRequest) {
  const requestedPath = request.nextUrl.searchParams.get("path");
  if (!requestedPath) {
    return NextResponse.json(
      { message: "A public services path is required." },
      { status: 400 },
    );
  }

  let endpoint: URL;
  try {
    endpoint = new URL(requestedPath, "https://wedplan.invalid");
  } catch {
    return NextResponse.json(
      { message: "The public services path is invalid." },
      { status: 400 },
    );
  }

  if (
    endpoint.origin !== "https://wedplan.invalid" ||
    (endpoint.pathname !== "/api/services" &&
      endpoint.pathname !== "/api/services/featured") ||
    [...endpoint.searchParams.keys()].some((key) => !allowedQueryKeys.has(key))
  ) {
    return NextResponse.json(
      { message: "The public services path is not allowed." },
      { status: 400 },
    );
  }

  let responseUrl: URL;
  try {
    responseUrl = resolveApiUrl(`${endpoint.pathname}${endpoint.search}`);
  } catch (error) {
    console.error("[services] Unable to resolve cached public request URL", {
      endpoint: requestedPath,
      envVar: "NEXT_PUBLIC_API_URL",
      error,
    });
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "The services API is not configured.",
      },
      { status: 500 },
    );
  }

  try {
    const response = await fetch(responseUrl, {
      next: { revalidate: 60 },
    });
    if (!response.ok) {
      console.error("[services] Cached public services API returned an error", {
        url: responseUrl.href,
        status: response.status,
        statusText: response.statusText,
      });
    }
    const headers = new Headers();
    const contentType = response.headers.get("content-type");
    if (contentType) {
      headers.set("content-type", contentType);
    }
    return new Response(response.body, {
      status: response.status,
      headers,
    });
  } catch (error) {
    console.error("[services] Cached public services request failed", {
      url: responseUrl.href,
      envVar: "NEXT_PUBLIC_API_URL",
      error,
    });
    return NextResponse.json(
      { message: "The services API could not be reached. Please try again." },
      { status: 502 },
    );
  }
}
