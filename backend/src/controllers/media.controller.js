import prisma from "../config/db.js";
import cloudinary from "../config/cloudinary.js";

export const uploadIssueMedia = async (req, res) => {
  try {
    const { issueId } = req.params;
    const user = req.user;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // 1️⃣ Validate issue
    const issue = await prisma.issue.findUnique({
      where: { id: issueId }
    });

    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    // 2️⃣ Decide purpose
    let purpose = "ISSUE_REPORTED";

    const isAdmin = await prisma.adminProfile.findUnique({
      where: { userId: user.id }
    });

    if (isAdmin) {
      purpose = "ADMIN_PROOF";
    }

    // 3️⃣ Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: "civic-monitor/issues",
          resource_type: "auto"
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    // 4️⃣ Save media
    const media = await prisma.media.create({
      data: {
        uploaderUserId: user.id,
        mediaType: uploadResult.resource_type === "video"
          ? "VIDEO"
          : "IMAGE",
        fileUrl: uploadResult.secure_url,
        thumbnailUrl: uploadResult.thumbnail_url || null
      }
    });

    // 5️⃣ Link media to issue
    await prisma.issueMedia.create({
      data: {
        issueId,
        mediaId: media.id,
        purpose
      }
    });

    res.status(201).json({
      message: "Media uploaded successfully",
      mediaUrl: media.fileUrl,
      purpose
    });

  } catch (error) {
    console.error("Cloudinary upload error:", error);
    res.status(500).json({ message: "Failed to upload media" });
  }
};
