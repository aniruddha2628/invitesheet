import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service.js';
import { AppError } from '../../utils/ownershipCheck.js';
import { env } from '../../config/env.js';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/api/v1/auth/refresh',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

/**
 * POST /api/v1/auth/register
 */
export async function registerHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/auth/verify-otp
 */
export async function verifyOtpHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.verifyOtp(req.body);
    res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);
    res.status(200).json({
      success: true,
      data: {
        accessToken: result.accessToken,
        user: result.user,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/auth/resend-otp
 */
export async function resendOtpHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.resendOtp(req.body);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/auth/login
 */
export async function loginHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.login(req.body);
    res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);
    res.status(200).json({
      success: true,
      data: {
        accessToken: result.accessToken,
        user: result.user,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/auth/logout
 * Auth required
 */
export async function logoutHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required.');
    }
    await authService.logout(req.user.userId);
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/api/v1/auth/refresh',
    });
    res.status(200).json({ success: true, data: { message: 'Logged out successfully.' } });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/auth/refresh
 */
export async function refreshHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new AppError(401, 'REFRESH_TOKEN_INVALID', 'Refresh token is missing.');
    }

    const result = await authService.refreshAccessToken(refreshToken);
    res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);
    res.status(200).json({
      success: true,
      data: { accessToken: result.accessToken },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/auth/forgot-password
 */
export async function forgotPasswordHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.forgotPassword(req.body);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/auth/reset-password
 */
export async function resetPasswordHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.resetPassword(req.body);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/auth/onboarding
 * Auth required, multipart/form-data
 */
export async function onboardingHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required.');
    }

    let logoUrl: string | undefined;

    // Handle logo upload to Cloudinary
    if (req.file) {
      // Validate file type
      const allowedMimes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedMimes.includes(req.file.mimetype)) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Logo must be PNG or JPG format.');
      }
      // Validate file size (2MB max)
      if (req.file.size > 2 * 1024 * 1024) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Logo must be under 2MB.');
      }

      // Upload to Cloudinary
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

    const result = await authService.onboarding(
      req.user.userId,
      {
        name: req.body.name,
        city: req.body.city,
        whatsapp: req.body.whatsapp,
      },
      logoUrl
    );

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}
