import { Request, Response } from "express"
import prisma from "../utils/prisma-client.js"
import { wktToGeoJSON } from "@terraformer/wkt";

export const getTenant = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { cognitoId } = req.params;

        const tenant = await prisma.tenant.findUnique({
            where: {
                cognitoId: cognitoId ?? ""
            },
            include: {
                favorites: true
            }
        });
        
        console.log(tenant)

        if (tenant) {
            res.json(tenant);
        } else {
            res.status(404).json({ message: "Tenant not found" })
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        res.status(500).json({ message: `Error retrieving tenant: ${error.message}` });
    }
}

export const createTenant = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { cognitoId, name, email, phoneNumber } = req.body;

        const tenant = await prisma.tenant.create({
            data: {
                cognitoId, name, email, phoneNumber
            }
        });

        res.json(tenant);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        res.status(500).json({ message: `Error creating tenant: ${error.message}` });
    }
}

export const updateTenant = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { cognitoId } = req.params
        const { name, email, phoneNumber } = req.body;

        if(!cognitoId || !name || !email || !phoneNumber){
            res.status(400).json({message: "Something is missing in the request"});
            return
        }

        const updateTenant = await prisma.tenant.update({
            where:{
                cognitoId
            },
            data: {
                cognitoId, name, email, phoneNumber
            }
        });

        res.json(updateTenant);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        res.status(500).json({ message: `Error Updating tenant: ${error.message}` });
    }
}

export const getTenantProperties = async (
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
                tenants: {
                    some: {cognitoId}
                }
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
            .json({ message: `Error retrieving tenant properties: ${err.message}` });
    }
};

export const addFavoriteProperty = async (
    req: Request,
    res: Response
): Promise<void> => {
    try{
        const {
            cognitoId,
            propertyId
        } =  req.params

        console.log(cognitoId, propertyId, req.params)
        const tenant = await prisma.tenant.findUnique({
            where: {
                cognitoId: cognitoId!
            },
            include: {
                favorites: true
            }
        })

        console.log(tenant)

        const propertyIdNumber = Number(propertyId);
        const existingFavorites = tenant?.favorites || []

        if(!existingFavorites.some(fav => fav.id == propertyIdNumber)){
            const updatedTenant = await prisma.tenant.update({
                where: {
                    cognitoId: cognitoId!
                },
                data: {
                    favorites: {
                        connect: {id: propertyIdNumber}
                    }
                },
                include: {
                    favorites: true
                }
            })
            console.log(updatedTenant.favorites)
            res.json(updatedTenant);
        }else{
            res.status(409).json({
                message: "Property already added as favorite"
            });
        }


    }catch(error: any){
        res.status(500).json(`Error adding favorite property: ${error.message}`)
    }
}

export const removeFavoriteProperty = async (
    req: Request,
    res: Response
): Promise<void> => {
    try{
        const {
            cognitoId,
            propertyId
        } =  req.params

        const propertyIdNumber = Number(propertyId);
        
        
            const updatedTenant = await prisma.tenant.update({
                where: {
                    cognitoId: cognitoId!
                },
                data: {
                    favorites: {
                        disconnect: {id: propertyIdNumber}
                    }
                },
                include: {
                    favorites: true
                }
            })

            res.json(updatedTenant);

    }catch(error: any){
        res.status(500).json(`Error adding favorite property: ${error.message}`)
    }
}