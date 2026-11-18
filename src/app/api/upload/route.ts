const maxImageSize = 5 * 1024 * 1024;
const acceptedImageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export async function POST(request: Request) {
  const apiKey = process.env.IMGBB_API_KEY;
  if (!apiKey) {
    return Response.json(
      { message: "Image uploads are not configured on this server." },
      { status: 503 },
    );
  }

  const formData = await request.formData();
  const image = formData.get("image");
  if (!(image instanceof File)) {
    return Response.json({ message: "Select an image to upload." }, { status: 400 });
  }
  if (!acceptedImageTypes.has(image.type)) {
    return Response.json(
      { message: "Use a JPG, PNG, or WebP image." },
      { status: 400 },
    );
  }
  if (image.size > maxImageSize) {
    return Response.json(
      { message: "Images must be 5 MB or smaller." },
      { status: 400 },
    );
  }

  const uploadData = new FormData();
  uploadData.set("image", image);

  const response = await fetch(
    `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`,
    { method: "POST", body: uploadData },
  );
  const result = (await response.json()) as {
    success?: boolean;
    data?: { url?: string };
  };

  if (!response.ok || !result.success || !result.data?.url) {
    return Response.json(
      { message: "The image could not be uploaded. Please try again." },
      { status: 502 },
    );
  }

  return Response.json({ url: result.data.url });
}
