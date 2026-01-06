import prisma from "../config/db.js";

export const getAdminFeed = async (req, res) => {
  try {
    const user = req.user;

    // 1️⃣ Check admin profile
    const adminProfile = await prisma.adminProfile.findUnique({
      where: { userId: user.id },
      include: {
        departments: true,
        localities: true
      }
    });

    if (!adminProfile) {
      return res.status(403).json({
        message: "Access denied. Admins only."
      });
    }

    const departmentIds = adminProfile.departments.map(d => d.departmentId);
    const localityIds = adminProfile.localities.map(l => l.localityId);

    // 2️⃣ Fetch issues
    const issues = await prisma.issue.findMany({
      where: {
        departmentId: { in: departmentIds },
        localityId: { in: localityIds }
      },
      orderBy: {
        slaDeadline: "asc"
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        slaDeadline: true,

        status: {
          select: { name: true }
        },

        category: {
          select: { name: true }
        },

        locality: {
          select: { name: true }
        },

        mediaLinks: {
          where: { purpose: "ISSUE_REPORTED" },
          select: {
            media: {
              select: {
                mediaType: true,
                fileUrl: true
              }
            }
          }
        }
      }
    });

    // 3️⃣ Format response
    const response = issues.map(issue => ({
      id: issue.id,
      title: issue.title,
      category: issue.category.name,
      status: issue.status.name,
      locality: issue.locality.name,
      createdAt: issue.createdAt,
      slaDeadline: issue.slaDeadline,
      media: issue.mediaLinks.map(m => ({
        type: m.media.mediaType,
        url: m.media.fileUrl
      }))
    }));

    res.json(response);

  } catch (error) {
    console.error("Admin feed error:", error);
    res.status(500).json({ message: "Failed to fetch admin issues" });
  }
};

export const updateIssueStatus = async (req, res) => {
  try {
    const { issueId } = req.params;
    const { status, remarks } = req.body;
    const user = req.user;

    // 1️⃣ Validate admin
    const adminProfile = await prisma.adminProfile.findUnique({
      where: { userId: user.id },
      include: {
        departments: true,
        localities: true
      }
    });

    if (!adminProfile) {
      return res.status(403).json({ message: "Admins only" });
    }

    // 2️⃣ Validate issue
    const issue = await prisma.issue.findUnique({
      where: { id: issueId }
    });

    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    // 3️⃣ Authorization check
    const departmentAllowed = adminProfile.departments.some(
      d => d.departmentId === issue.departmentId
    );

    const localityAllowed = adminProfile.localities.some(
      l => l.localityId === issue.localityId
    );

    if (!departmentAllowed || !localityAllowed) {
      return res.status(403).json({
        message: "Not authorized for this issue"
      });
    }

    // 4️⃣ Validate status
    const allowedStatuses = [
      "IN_PROGRESS",
      "RESOLVED_PENDING_USER"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status transition"
      });
    }

    const newStatus = await prisma.issueStatus.findUnique({
      where: { name: status }
    });

    if (!newStatus) {
      return res.status(500).json({
        message: "Status not configured"
      });
    }

    // 5️⃣ Transaction
    await prisma.$transaction(async (tx) => {
      await tx.issue.update({
        where: { id: issueId },
        data: {
          statusId: newStatus.id,
          currentAdminId: user.id
        }
      });

      await tx.issueStatusLog.create({
        data: {
          issueId,
          statusId: newStatus.id,
          changedByUserId: user.id,
          remarks: remarks || null
        }
      });
    });

    res.json({
      message: `Issue marked as ${status}`
    });

  } catch (error) {
    console.error("Admin status update error:", error);
    res.status(500).json({ message: "Failed to update issue status" });
  }
};
