import prisma from "../config/db.js";

export const createIssue = async (req, res) => {
  try {
    const { title, description, categoryId, localityId } = req.body;
    const user = req.user;

    if (!localityId) {
      return res.status(400).json({
        message: "localityId is required",
      });
    }

    if (!title || !description || !categoryId) {
      return res.status(400).json({
        message: "title, description and categoryId are required",
      });
    }

    const category = await prisma.issueCategory.findUnique({
      where: { id: categoryId },
      include: {
        department: true,
        slaRules: true,
      },
    });

    if (!category) {
      return res.status(404).json({ message: "Invalid issue category" });
    }

    const slaRule = category.slaRules.find((rule) => rule.adminLevel === 1);

    if (!slaRule) {
      return res.status(500).json({
        message: "SLA rule not configured for this category",
      });
    }

    const locality = await prisma.locality.findUnique({
      where: { id: localityId },
    });

    if (!locality) {
      return res.status(404).json({
        message: "Invalid locality",
      });
    }

    const slaDeadline = new Date();
    slaDeadline.setHours(slaDeadline.getHours() + slaRule.timeLimitHours);

    const openStatus = await prisma.issueStatus.findUnique({
      where: { name: "OPEN" },
    });

    if (!openStatus) {
      return res.status(500).json({
        message: "OPEN status not configured",
      });
    }

    const issue = await prisma.$transaction(async (tx) => {
      const createdIssue = await tx.issue.create({
        data: {
          title,
          description,
          userId: user.id,
          categoryId,
          departmentId: category.departmentId,
          localityId,
          statusId: openStatus.id,
          slaDeadline,
        },
      });

      await tx.issueStatusLog.create({
        data: {
          issueId: createdIssue.id,
          statusId: openStatus.id,
          changedByUserId: user.id,
          remarks: "Issue reported",
        },
      });

      return createdIssue;
    });

    res.status(201).json({
      message: "Issue created successfully",
      issueId: issue.id,
    });
  } catch (error) {
    console.error("Create issue error:", error);
    res.status(500).json({ message: "Failed to create issue" });
  }
};

export const getCitizenFeed = async (req, res) => {
  try {
    const user = req.user;

    const issues = await prisma.issue.findMany({
      where: {
        localityId: user.localityId,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,

        status: {
          select: { name: true },
        },

        category: {
          select: { name: true },
        },

        department: {
          select: { name: true },
        },

        _count: {
          select: {
            upvotes: true,
            comments: true,
          },
        },

        mediaLinks: {
          where: {
            purpose: "ISSUE_REPORTED",
          },
          select: {
            media: {
              select: {
                id: true,
                mediaType: true,
                fileUrl: true,
                thumbnailUrl: true,
              },
            },
          },
        },
      },
    });

    const formattedIssues = issues.map((issue) => ({
      id: issue.id,
      title: issue.title,
      description: issue.description,
      status: issue.status.name,
      category: issue.category.name,
      department: issue.department.name,
      createdAt: issue.createdAt,
      upvotes: issue._count.upvotes,
      comments: issue._count.comments,
      media: issue.mediaLinks.map((m) => ({
        id: m.media.id,
        type: m.media.mediaType,
        url: m.media.fileUrl,
        thumbnail: m.media.thumbnailUrl,
      })),
    }));

    res.json(formattedIssues);
  } catch (error) {
    console.error("Citizen feed error:", error);
    res.status(500).json({ message: "Failed to fetch issue feed" });
  }
};

export const getUniversalFeed = async (req, res) => {
  try {
    const user = req.user;

    const issues = await prisma.issue.findMany({
      where: {
        locality: {
          zone: {
            cityId: user.cityId,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
        createdAt: true,

        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            profilePhotoUrl: true,
          },
        },

        status: {
          select: { name: true },
        },

        category: {
          select: { name: true },
        },

        locality: {
          select: { name: true },
        },

        mediaLinks: {
          where: { purpose: "ISSUE_REPORTED" },
          select: {
            media: {
              select: {
                mediaType: true,
                fileUrl: true,
              },
            },
          },
        },
      },
    });

    const response = issues.map((issue) => ({
      id: issue.id,
      title: issue.title,

      postedBy: {
        id: issue.user.id,
        email: issue.user.email,
        name: issue.user.fullName,
        avatar: issue.user.profilePhotoUrl,
      },

      status: issue.status.name,
      category: issue.category.name,
      locality: issue.locality.name,
      createdAt: issue.createdAt,

      media: issue.mediaLinks.map((m) => ({
        type: m.media.mediaType,
        url: m.media.fileUrl,
      })),
    }));

    res.json(response);
  } catch (error) {
    console.error("Explore feed error:", error);
    res.status(500).json({ message: "Failed to fetch issues" });
  }
};

export const toggleUpvote = async (req, res) => {
  try {
    const { issueId } = req.params;
    const userId = req.user.id;

    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
      select: { id: true },
    });

    if (!issue) {
      return res.status(404).json({
        message: "Issue does not exist",
      });
    }
    const existing = await prisma.issueUpvote.findUnique({
      where: {
        issueId_userId: {
          issueId,
          userId,
        },
      },
    });

    if (existing) {
      await prisma.issueUpvote.delete({
        where: {
          issueId_userId: {
            issueId,
            userId,
          },
        },
      });

      return res.json({ message: "Upvote removed" });
    }

    await prisma.issueUpvote.create({
      data: {
        issueId,
        userId,
      },
    });

    res.json({ message: "Upvoted successfully" });
  } catch (error) {
    console.error("Upvote error:", error);
    res.status(500).json({ message: "Failed to toggle upvote" });
  }
};

export const addComment = async (req, res) => {
  try {
    const { issueId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || content.trim() === "") {
      return res.status(400).json({ message: "Comment content required" });
    }

    // 🔥 CRITICAL CHECK (missing before)
    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
      select: { id: true },
    });

    if (!issue) {
      return res.status(404).json({
        message: "Issue does not exist",
      });
    }

    const comment = await prisma.comment.create({
      data: {
        issueId,
        userId,
        content,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        user: {
          select: {
            fullName: true,
          },
        },
      },
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error("Comment error:", error);
    res.status(500).json({ message: "Failed to add comment" });
  }
};

export const getComments = async (req, res) => {
  try {
    const { issueId } = req.params;

    const comments = await prisma.comment.findMany({
      where: { issueId },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        content: true,
        createdAt: true,
        user: {
          select: {
            fullName: true,
          },
        },
      },
    });

    res.json(comments);
  } catch (error) {
    console.error("Get comments error:", error);
    res.status(500).json({ message: "Failed to fetch comments" });
  }
};

export const verifyIssue = async (req, res) => {
  try {
    const { issueId } = req.params;
    const { feedback } = req.body;
    const user = req.user;

    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
      include: {
        status: true,
      },
    });

    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    if (issue.userId !== user.id) {
      return res.status(403).json({
        message: "Only issue creator can verify",
      });
    }

    if (issue.status.name !== "RESOLVED_PENDING_USER") {
      return res.status(400).json({
        message: "Issue is not ready for verification",
      });
    }

    const verifiedStatus = await prisma.issueStatus.findUnique({
      where: { name: "VERIFIED" },
    });

    const closedStatus = await prisma.issueStatus.findUnique({
      where: { name: "CLOSED" },
    });

    if (!verifiedStatus || !closedStatus) {
      return res.status(500).json({
        message: "Verification statuses not configured",
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.issueVerification.create({
        data: {
          issueId,
          userId: user.id,
          feedback: feedback || null,
          verifiedAt: new Date(),
        },
      });

      await tx.issue.update({
        where: { id: issueId },
        data: {
          statusId: verifiedStatus.id,
        },
      });

      await tx.issueStatusLog.create({
        data: {
          issueId,
          statusId: verifiedStatus.id,
          changedByUserId: user.id,
          remarks: "Issue verified by citizen",
        },
      });

      await tx.issue.update({
        where: { id: issueId },
        data: {
          statusId: closedStatus.id,
        },
      });

      await tx.issueStatusLog.create({
        data: {
          issueId,
          statusId: closedStatus.id,
          changedByUserId: user.id,
          remarks: "Issue closed",
        },
      });
    });

    res.json({
      message: "Issue verified and closed successfully",
    });
  } catch (error) {
    console.error("Issue verification error:", error);
    res.status(500).json({ message: "Failed to verify issue" });
  }
};
