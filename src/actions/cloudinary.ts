"use server";

import { v2 as cloudinary } from "cloudinary";
import { requireUser } from "@/lib/auth";

const cloudinaryUrl = process.env.CLOUDINARY_URL || "";
const [apiKey, rest] = cloudinaryUrl.replace("cloudinary://", "").split(":");
const [apiSecret, cloudName] = (rest || "").split("@");

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

export async function getCloudinarySignature(folder: string = "ExOwn_products") {
  await requireUser();

  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    cloudinary.config().api_secret!
  );

  return {
    timestamp,
    signature,
    apiKey: cloudinary.config().api_key || "",
    cloudName: cloudinary.config().cloud_name || ""
  };
}
