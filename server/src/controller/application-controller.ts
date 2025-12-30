import { Request, Response } from "express"
import prisma from "../utils/prisma-client.js"
import { connect } from "node:http2";

export const listApplications = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const {
            userId, userType
        } = req.query;

        let whereClause = {}

        if (userId && userType) {
            if (userType === "tenant") {
                whereClause = { tenantCongnitoId: String(userId) };
            } else if (userType === "manager") {
                whereClause = { managerCongnitoId: String(userId) };
            }
        }

        const applications = await prisma.application.findMany({
            where: whereClause,
            include: {
                property: {
                    include: {
                        location: true,
                        manager: true
                    }
                }
            }
        })

        function calculateNextPaymentDate(startDate: Date): Date {
            const today = new Date();
            const nextPaymentDate = new Date(startDate);
            while (nextPaymentDate <= today) {
                nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
            }

            return nextPaymentDate;
        }

        const formattedApplications = await Promise.all(
            applications.map(async (app) => {
                const lease = await prisma.lease.findFirst({
                    where: {
                        tenant: {
                            cognitoId: app.tenantCognitoId
                        },
                        propertyId: app.propertyId
                    },
                    orderBy: { startDate: "desc" }
                })

                return {
                    ...app,
                    property: {
                        ...app.property,
                        address: app.property.location.address,
                    },
                    manager: app.property.manager,
                    lease: lease ? { ...lease, nextPaymentDate: calculateNextPaymentDate(lease.startDate) } : null
                }
            })
        )

        res.json(formattedApplications)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        res.status(500).json({ message: `Error retrieving Applications: ${error.message}` });
    }
}

export const createApplication = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const {
            applicationDate,
            status,
            propertyId,
            tenantCognitoId,
            name,
            email,
            phoneNumber,
            message
        } = req.body

        const property = await prisma.property.findUnique({
            where: {
                id: propertyId
            },
            select: {
                pricePerMonth: true,
                securityDeposit: true
            }
        })

        if (!property) {
            res.status(404).json({
                message: "Property not found"
            });
            return;
        }

        const newApplication = await prisma.$transaction(async (prisma) => {
            const lease = await prisma.lease.create({
                data: {
                    startDate: new Date(),
                    endDate: new Date(
                        new Date().setFullYear(new Date().getFullYear() + 1)
                    ),
                    rent: property?.pricePerMonth || 0,
                    deposit: property?.securityDeposit || 0,
                    property: {
                        connect: {
                            id: propertyId
                        }
                    },
                    tenant: {
                        connect: {
                            cognitoId: tenantCognitoId
                        }
                    }
                }
            });

            const application = await prisma.application.create({
                data: {
                    applicationDate: new Date(),
                    status,
                    name,
                    email,
                    phoneNumber,
                    message,
                    property: {
                        connect: {
                            id: propertyId
                        }
                    },
                    tenant: {
                        connect: {
                            cognitoId: tenantCognitoId
                        }
                    },
                    lease: {
                        connect: {
                            id: lease.id
                        }
                    }
                },
                include: {
                    property: true,
                    tenant: true,
                    lease: true
                }
            })
            return application;
        });

        res.status(201).json(newApplication);
    } catch (error: any) {
        res.status(500).json({ message: `Error creating Applications: ${error.message}` });
    }
}

export const updateApplictaionStatus = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const application = await prisma.application.findUnique({
            where: {
                id: Number(id)
            },
            include: {
                property: true,
                tenant: true
            }
        });

        if (!application){
            res.status(404).json({ message: "Application not found" });
            return
        }

        
        if (status == "Approved") {
            const newLease = await prisma.lease.create({
                data: {
                    startDate: new Date(),
                    endDate: new Date(
                        new Date().setFullYear(new Date().getFullYear() + 1)
                    ),
                    rent: application.property.pricePerMonth,
                    deposit: application.property.securityDeposit,
                    propertyId: application.propertyId,
                    tenantCognitoId: application.tenantCognitoId
                }
            });

            await prisma.property.update({
                where: {
                    id: application.propertyId
                },
                data: {
                    tenants: {
                        connect: {
                            cognitoId: application.tenantCognitoId
                        }
                    }
                }
            })

            await prisma.application.update({
                where: {
                    id: Number(id)
                },
                data: {
                    status, leaseId: newLease.id
                },
                include: {
                    property: true,
                    tenant: true,
                    lease: true
                }
            });
        }else{
            await prisma.application.update({
                where: {
                    id: Number(id)
                },
                data: {
                    status
                },
                include: {
                    property: true,
                    tenant: true,
                    lease: true
                }
            });
        }

        const updatedApplication = await prisma.application.findUnique({
            where: {
                id: Number(id)
            },
            include: {
                tenant: true,
                property: true,
                lease: true
            }
        })

        res.json(updatedApplication)
    } catch (error: any) {
        res.status(500).json({ message: `Error Updating Applications Status: ${error.message}` });
    }
}