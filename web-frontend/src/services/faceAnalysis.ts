const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error(
    "VITE_API_URL is missing in .env"
  );
}

export type FaceAnalysisRequest = {
  front: string;
  left: string;
  right: string;
};

export async function analyzeMultiAngleFace(
  images: FaceAnalysisRequest
) {
  const controller =
    new AbortController();

  const timeout =
    window.setTimeout(() => {
      controller.abort();
    }, 120000);

  try {
    const response = await fetch(
      `${API_URL}/api/v1/face/analyze`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          front: images.front,
          left: images.left,
          right: images.right,
        }),
        signal:
          controller.signal,
      }
    );

    const responseText =
      await response.text();

    if (!response.ok) {
      throw new Error(
        `Face analysis failed (${response.status}): ${responseText}`
      );
    }

    try {
      return JSON.parse(
        responseText
      );
    } catch {
      throw new Error(
        "Backend returned invalid JSON response"
      );
    }
  } catch (
    error: any
  ) {
    console.error(
      "FACE ANALYSIS ERROR:",
      error
    );

    if (
      error?.name ===
      "AbortError"
    ) {
      throw new Error(
        "Face analysis timed out. Please try again."
      );
    }

    if (
      error instanceof TypeError &&
      error.message ===
        "Failed to fetch"
    ) {
      throw new Error(
        `Unable to connect to backend at ${API_URL}`
      );
    }

    throw error;
  } finally {
    window.clearTimeout(
      timeout
    );
  }
}