import prisma from "../config/db.js";

export const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        profilePhotoUrl: true,
        bio: true,
        isVerified: true,
        createdAt: true,
        city: { select: { id: true, name: true } },
        zone: { select: { id: true, name: true } },
        locality: { select: { id: true, name: true } },
        roles: {
          select: {
            role: { select: { name: true } }
          }
        }
      }
    });

    res.json({
      ...user,
      roles: user.roles.map(r => r.role.name)
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch user profile" });
  }
};


export const updateMe = async (req, res) => {
  try {
    const { fullName, profilePhotoUrl, bio, cityId, zoneId, localityId } = req.body;

    // Validate location hierarchy if provided
    if (cityId || zoneId || localityId) {
      const locality = await prisma.locality.findFirst({
        where: {
          id: localityId,
          zoneId,
          zone: { cityId }
        }
      });

      if (!locality) {
        return res.status(400).json({ message: "Invalid location selection" });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        fullName,
        profilePhotoUrl,
        bio,
        cityId,
        zoneId,
        localityId
      },
      select: {
        id: true,
        fullName: true,
        profilePhotoUrl: true,
        bio: true,
        city: { select: { id: true, name: true } },
        zone: { select: { id: true, name: true } },
        locality: { select: { id: true, name: true } }
      }
    });

    res.json(updatedUser);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Profile update failed" });
  }
};
