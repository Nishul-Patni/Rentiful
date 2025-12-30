import { Request, Response } from "express"
import prisma from "../utils/prisma-client.js"

export const getLeases = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {

        const leases = await prisma.lease.findMany({
            include: {
              tenant: true,
              property: true
            }
        })

        res.json(leases)
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        res.status(500).json({ message: `Error retrieving leases: ${error.message}` });
    }
}


export const getLeasePayments = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        
        const { id } = req.params;
        const payments = await prisma.payment.findMany({
            where: {
                leaseId: Number(id)
            }
        })

        res.json(payments)
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        res.status(500).json({ message: `Error retrieving Lease Payments: ${error.message}` });
    }
}