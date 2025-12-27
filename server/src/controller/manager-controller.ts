import { Request, Response } from "express"
import prisma from "../utils/prisma-client.js"

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

        if(!cognitoId || !name || !email || !phoneNumber){
            res.status(400).json({message: "Something is missing in the request"});
            return
        }

        const updateManager = await prisma.manager.update({
            where:{
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