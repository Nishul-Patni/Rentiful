import { Request, Response } from "express"
import prisma from "../utils/prisma-client.js"

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