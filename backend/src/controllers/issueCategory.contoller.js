import prisma from "../config/db.js";

export const getIssueCategories = async (req, res) => {
  try {
    const categories = await prisma.issueCategory.findMany({
      select: {
        id: true,
        name: true,
        department: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { name: "asc" }
    });

    res.json(categories);
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
};
