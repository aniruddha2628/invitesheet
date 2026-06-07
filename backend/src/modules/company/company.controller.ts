import { Request, Response, NextFunction } from 'express';
import * as companyService from './company.service.js';
import { AppError } from '../../utils/ownershipCheck.js';
import { v2 as cloudinary } from 'cloudinary';

/** PATCH /api/v1/company */
export async function updateCompanyHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Authentication required.');

    let logoUrl: string | undefined;

    if (req.file) {
      const allowedMimes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedMimes.includes(req.file.mimetype)) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Logo must be PNG or JPG format.');
      }
      if (req.file.size > 2 * 1024 * 1024) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Logo must be under 2MB.');
      }

      const uploadResult = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'invitesheet/logos',
            transformation: [{ width: 400, height: 400, crop: 'limit' }],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(req.file!.buffer);
      });

      logoUrl = uploadResult.secure_url;
    }

    const data = await companyService.updateCompany(req.user.userId, req.body, logoUrl);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}
