import prisma from "../config/db.js";


export const getCities = async (req, res) => {
  try {
    const cities = await prisma.city.findMany({
      select: {
        id: true,
        name: true,
        state: true
      },
      orderBy: { name: "asc" }
    });

    res.json(cities);
  } catch (error) {
    console.error("Get cities error:", error);
    res.status(500).json({ message: "Failed to fetch cities" });
  }
};


export const getZones = async (req, res) => {
  try {
    const { cityId } = req.query;

    if (!cityId) {
      return res.status(400).json({ message: "cityId is required" });
    }

    const zones = await prisma.zone.findMany({
      where: { cityId },
      select: {
        id: true,
        name: true
      },
      orderBy: { name: "asc" }
    });

    res.json(zones);
  } catch (error) {
    console.error("Get zones error:", error);
    res.status(500).json({ message: "Failed to fetch zones" });
  }
};


export const getLocalities = async (req, res) => {
  try {
    const { zoneId } = req.query;

    if (!zoneId) {
      return res.status(400).json({ message: "zoneId is required" });
    }

    const localities = await prisma.locality.findMany({
      where: { zoneId },
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true
      },
      orderBy: { name: "asc" }
    });

    res.json(localities);
  } catch (error) {
    console.error("Get localities error:", error);
    res.status(500).json({ message: "Failed to fetch localities" });
  }
};
