import { Company } from './company.model.js';
import { AppError } from '../../utils/ownershipCheck.js';

/**
 * PATCH /company — Update company profile.
 */
export async function updateCompany(
  userId: string,
  data: { name?: string; city?: string; whatsappNumber?: string },
  logoUrl?: string
) {
  const company = await Company.findOne({ userId });
  if (!company) {
    throw new AppError(404, 'NOT_FOUND', 'Company not found. Please complete onboarding first.');
  }

  if (data.name !== undefined) company.name = data.name;
  if (data.city !== undefined) company.city = data.city;
  if (data.whatsappNumber !== undefined) company.whatsappNumber = data.whatsappNumber;
  if (logoUrl) company.logoUrl = logoUrl;

  await company.save();

  return {
    _id: company._id,
    name: company.name,
    city: company.city,
    whatsappNumber: company.whatsappNumber,
    logoUrl: company.logoUrl,
  };
}
