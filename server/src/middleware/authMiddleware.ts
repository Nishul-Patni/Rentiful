import type { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";


interface DecodedToken extends JwtPayload{
    sub: string;
    "custom:role"?: string
}

declare global {
    namespace Express {
        interface Request {
            user? : {
                id: string,
                role: string
            }
        }
    }
}

export const authMiddleware = (allowedRules: string[]) =>{
    return (req: Request, res: Response, next: NextFunction) : void =>{
        const token = req.headers.authorization?.split(" ")[1];
        
        if(!token){
            res.status(401).json({
                message: "Unauthorized"
            })

            return;
        }

        try{
            const decodedToken = jwt.decode(token) as DecodedToken;
            const userRole = decodedToken["custom:role"] || "";
            console.log(userRole)
            console.log(decodedToken)
            req.user = {
                id: decodedToken.sub,
                role: userRole
            }

            const hasAccess = allowedRules.includes(userRole.toLocaleLowerCase());
            console.log(hasAccess, allowedRules)
            if(!hasAccess){
                res.status(403).json({message: "Access Denied"});
                return;
            }

        }catch(error){
            res.status(400).json({
                messag: "Invalid Token"
            });

            console.log("Failed to decode Token: ", error);
            return;
        }   

        next();
    }
}