import { Request, Response } from "express"
import prisma from "../utils/prisma-client.js"
import { wktToGeoJSON } from "@terraformer/wkt";

export const getManager = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { cognitoId } = req.params;


        const manager = await prisma.manager.findUnique({
            where: {
                cognitoId: cognitoId ?? ""
            }
        });

        if (manager) {
            res.json(manager);
        } else {
            res.status(404).json({ message: "Manager not found" })
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        res.status(500).json({ message: `Error retrieving manager: ${error.message}` });
    }
}

export const createManager = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { cognitoId, name, email, phoneNumber } = req.body;

        const manager = await prisma.manager.create({
            data: {
                cognitoId, name, email, phoneNumber
            }
        });

        res.json(manager);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        res.status(500).json({ message: `Error creating manager: ${error.message}` });
    }
}

export const updateManager = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { cognitoId } = req.params
        const { name, email, phoneNumber } = req.body;

        if (!cognitoId || !name || !email || !phoneNumber) {
            res.status(400).json({ message: "Something is missing in the request" });
            return
        }

        const updateManager = await prisma.manager.update({
            where: {
                cognitoId
            },
            data: {
                cognitoId, name, email, phoneNumber
            }
        });

        res.json(updateManager);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        res.status(500).json({ message: `Error Updating Manager: ${error.message}` });
    }
}

export const getManagerProperties = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { cognitoId } = req.params;

        if (!cognitoId) {
            res.status(400).json({ message: 'Cognito id is required' })
            return
        }

        const properties = await prisma.property.findMany({
            where: {
                managerCognitoId: cognitoId
            },
            include: {
                location: true,
            },
        });

        const propertiesWithFormattedLocation = await Promise.all(
            properties.map(async (property) => {
                const coordinates: { coordinates: string }[] =
                    await prisma.$queryRaw`SELECT ST_asText(coordinates) as coordinates from "Location" where id = ${property.location.id}`;
                const geoJSON: any = wktToGeoJSON(coordinates[0]?.coordinates || "");
                const longitude = geoJSON.coordinates[0];
                const latitude = geoJSON.coordinates[1];
                
                return {
                    ...property,
                    location: {
                        ...property.location,
                        coordinates: {
                            longitude,
                            latitude,
                        },
                    },
                };

            })
        )

        res.json(propertiesWithFormattedLocation)

    } catch (err: any) {
        res
            .status(500)
            .json({ message: `Error retrieving manager properties: ${err.message}` });
    }
};
