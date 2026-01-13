import { Request, Response, NextFunction } from 'express';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

export function validationMiddleware(dtoClass: any) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const dtoObj = plainToInstance(dtoClass, req.body);
        const errors = await validate(dtoObj);

        if (errors.length > 0) {
            const formattedErrors = errors.map((error) => ({
                property: error.property,
                constraints: error.constraints,
            }));
            res.status(400).json({ message: 'Validation Failed', errors: formattedErrors });
            return;
        } else {
            req.body = dtoObj;
            next();
        }
    };
}
