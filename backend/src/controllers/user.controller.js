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
        },

        adminProfile: {
          select: { userId: true } 
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const roles = user.roles.map(r => r.role.name);
    const isAdmin = !!user.adminProfile;

    if (isAdmin) {
      roles.push("admin");
    }

    res.json({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      profilePhotoUrl: user.profilePhotoUrl,
      bio: user.bio,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      city: user.city,
      zone: user.zone,
      locality: user.locality,
      roles: [...new Set(roles)],
      isAdmin
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
