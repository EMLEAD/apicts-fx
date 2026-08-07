import { lookupNIN, lookupDriverLicense, lookupVotersID } from './client';

function joinName(parts) {
  return parts.filter(Boolean).join(' ').trim();
}

function splitName(fullName) {
  if (!fullName) return { firstName: '', lastName: '' };
  const parts = fullName.trim().split(/\s+/);
  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' ') || parts[0] || '',
  };
}

function toIsoDate(value) {
  if (!value) return null;
  const str = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  const m = str.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  return null;
}

function toDbGender(value) {
  if (!value) return null;
  const g = value.toLowerCase();
  if (g === 'm' || g === 'male') return 'male';
  if (g === 'f' || g === 'female') return 'female';
  return null;
}

export async function verifyWithPrembly(documentType, documentNumber, fullName) {
  let result;

  const { firstName, lastName } = splitName(fullName);

  switch (documentType) {
    case 'nin':
      result = await lookupNIN(documentNumber);
      break;
    case 'drivers_license':
      result = await lookupDriverLicense(documentNumber, firstName, lastName);
      break;
    case 'voters_card':
      result = await lookupVotersID(documentNumber);
      break;
    default:
      throw new Error(`Unsupported document type: ${documentType}`);
  }

  const isVerified = result?.verification?.status === 'VERIFIED';

  if (!isVerified) {
    return {
      verified: false,
      reason: result?.detail || result?.message || 'Prembly verification failed',
      apiResponse: result,
      extractedData: null,
    };
  }

  const entity = result?.data || result?.nin_data || result?.frsc_data || {};
  const apiFullName = entity.fullName || joinName([
    entity.firstname || '',
    entity.middlename || '',
    entity.surname || '',
  ]) || joinName([
    entity.first_name || '',
    entity.middle_name || '',
    entity.last_name || '',
  ]);

  const extractedData = {
    fullName: apiFullName,
    dateOfBirth: toIsoDate(entity.birthdate || entity.date_of_birth || entity.birthDate) || null,
    gender: toDbGender(entity.gender) || null,
    documentNumber,
  };

  if (documentType === 'nin') {
    extractedData.phoneNumber = entity.telephoneno || entity.phone_number || null;
    extractedData.maritalStatus = entity.maritalstatus || entity.marital_status || null;
    extractedData.profession = entity.profession || null;
    extractedData.photo = entity.photo || null;
  }

  if (documentType === 'drivers_license') {
    extractedData.licenseNo = entity.driversLicense || entity.licenseNo || null;
    extractedData.issuedDate = entity.issuedDate || null;
    extractedData.expiryDate = entity.expiryDate || null;
    extractedData.stateOfIssue = entity.stateOfIssue || null;
    extractedData.photo = entity.photo || null;
  }

  if (documentType === 'voters_card') {
    extractedData.vin = entity.vin || entity.voter_identification_number || null;
    extractedData.state = entity.state || null;
    extractedData.localGovernment = entity.lga || entity.local_government || null;
    extractedData.pollingUnit = entity.pollingUnit || entity.polling_unit || null;
    extractedData.photo = entity.photo || null;
  }

  return {
    verified: true,
    reason: null,
    apiResponse: result,
    extractedData,
  };
}
