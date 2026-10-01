import { supabase } from "@/lib/supabase";

/* ============================================================
   HELPERS
============================================================ */

const dataUrlToBlob = async (
  dataUrl: string
): Promise<Blob> => {
  const response = await fetch(
    dataUrl
  );

  return await response.blob();
};

const urlToBlob = async (
  url: string
): Promise<Blob> => {
  const response = await fetch(
    url
  );

  if (!response.ok) {
    throw new Error(
      `Unable to read image: ${response.status}`
    );
  }

  return await response.blob();
};

/* ============================================================
   UPLOAD FACE IMAGE

   Supports:
   - File
   - Blob
   - data:image/... URL
   - blob: URL
   - normal HTTP/HTTPS image URL

   Same storage path as mobile:
   {userId}/{timestamp}_{angle}.jpg
============================================================ */

export const uploadFaceImage = async (
  image:
    | File
    | Blob
    | string,
  userId: string,
  angle: string
): Promise<string> => {
  try {
    if (!image) {
      throw new Error(
        "Image missing"
      );
    }

    if (!userId) {
      throw new Error(
        "User/Profile ID missing"
      );
    }

    if (!angle) {
      throw new Error(
        "Image angle missing"
      );
    }

    let blob: Blob;

    /* ========================================================
       FILE / BLOB
    ======================================================== */

    if (
      image instanceof Blob
    ) {
      blob = image;
    }

    /* ========================================================
       STRING URI
    ======================================================== */

    else if (
      typeof image ===
      "string"
    ) {
      if (
        image.startsWith(
          "data:"
        )
      ) {
        blob =
          await dataUrlToBlob(
            image
          );
      } else if (
        image.startsWith(
          "blob:"
        ) ||
        image.startsWith(
          "http://"
        ) ||
        image.startsWith(
          "https://"
        )
      ) {
        blob =
          await urlToBlob(
            image
          );
      } else {
        throw new Error(
          "Unsupported image source"
        );
      }
    } else {
      throw new Error(
        "Invalid image input"
      );
    }

    if (!blob.size) {
      throw new Error(
        "Image data is empty"
      );
    }

    /* ========================================================
       STORAGE PATH
    ======================================================== */

    const filePath =
      `${userId}/${Date.now()}_${angle}.jpg`;

    /* ========================================================
       UPLOAD
    ======================================================== */

    const {
      error,
    } =
      await supabase.storage
        .from("face-scans")
        .upload(
          filePath,
          blob,
          {
            contentType:
              blob.type ||
              "image/jpeg",

            upsert: true,
          }
        );

    if (error) {
      console.error(
        "UPLOAD ERROR:",
        error
      );

      throw error;
    }

    /* ========================================================
       PUBLIC URL
    ======================================================== */

    const {
      data,
    } =
      supabase.storage
        .from("face-scans")
        .getPublicUrl(
          filePath
        );

    if (
      !data?.publicUrl
    ) {
      throw new Error(
        "Unable to generate image URL"
      );
    }

    console.log(
      "IMAGE URL:",
      angle,
      data.publicUrl
    );

    return data.publicUrl;
  } catch (
    error
  ) {
    console.error(
      "FACE IMAGE UPLOAD FAILED:",
      error
    );

    throw error;
  }
};