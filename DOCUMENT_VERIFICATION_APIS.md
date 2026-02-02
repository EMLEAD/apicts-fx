# Document Verification APIs for Nigeria

## Overview
This document outlines available APIs for automatic verification of Nigerian identification documents.

## Available Verification APIs

### 1. **NIN (National Identification Number) Verification**

#### NIMC API (Official)
- **Provider**: National Identity Management Commission (NIMC)
- **Status**: Available for registered organizations
- **Documents**: NIN verification
- **Process**: 
  - Register with NIMC as a verification partner
  - Get API credentials
  - Integrate with their verification endpoint
- **Cost**: Paid service (contact NIMC for pricing)
- **Verification**: Real-time verification against NIMC database
- **Returns**: Name, Date of Birth, Gender, Photo (if authorized)
- **Website**: https://nimc.gov.ng

#### Third-Party NIN Verification Services
Several aggregators provide NIN verification:

**a) Smile Identity**
- **Website**: https://usesmileid.com
- **Features**: NIN verification, facial recognition
- **Pricing**: Pay-per-verification
- **Returns**: Full name, DOB, gender, photo
- **Integration**: REST API

**b) Youverify**
- **Website**: https://youverify.co
- **Features**: NIN, BVN, Driver's License verification
- **Pricing**: Subscription-based
- **Returns**: Comprehensive identity data
- **Integration**: REST API with webhooks

**c) Dojah**
- **Website**: https://dojah.io
- **Features**: NIN, BVN, CAC, Driver's License
- **Pricing**: Pay-as-you-go
- **Returns**: Identity verification with match score
- **Integration**: REST API, SDKs available

**d) Prembly (formerly IdentityPass)**
- **Website**: https://prembly.com
- **Features**: Multi-document verification (NIN, BVN, Driver's License, Voter's Card)
- **Pricing**: Flexible pricing
- **Returns**: Verified identity data
- **Integration**: REST API

### 2. **Driver's License Verification**

#### FRSC API (Federal Road Safety Corps)
- **Provider**: Federal Road Safety Corps
- **Status**: Available through partnerships
- **Documents**: Driver's License
- **Process**: Partner with FRSC or use third-party aggregators
- **Cost**: Varies
- **Returns**: License details, validity status

#### Third-Party Services
- **Dojah**: Supports driver's license verification
- **Youverify**: Supports driver's license verification
- **Prembly**: Supports driver's license verification

### 3. **Voter's Card Verification**

#### INEC Integration
- **Provider**: Independent National Electoral Commission (INEC)
- **Status**: Limited availability
- **Documents**: Permanent Voter's Card (PVC)
- **Note**: Less commonly available through APIs

### 4. **International Passport Verification**

#### Nigeria Immigration Service
- **Provider**: Nigeria Immigration Service (NIS)
- **Status**: Available through official channels
- **Documents**: International Passport
- **Note**: Requires official partnership

## Recommended Implementation Strategy

### Phase 1: Manual Verification (Current)
- Users submit documents
- Admin manually reviews and verifies
- Status: `pending` → `verified`/`rejected`

### Phase 2: Hybrid Verification
- Integrate with one third-party provider (e.g., Dojah or Prembly)
- Automatic verification for NIN
- Manual verification for other documents
- Fallback to manual if API fails

### Phase 3: Full Automation
- Multi-provider integration
- Automatic verification for all document types
- Manual review only for edge cases

## Integration Example (Dojah API)

```javascript
// Example integration with Dojah
const verifyNIN = async (nin, firstName, lastName, dateOfBirth) => {
  const response = await fetch('https://api.dojah.io/api/v1/kyc/nin', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.DOJAH_API_KEY}`,
      'AppId': process.env.DOJAH_APP_ID,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      nin,
      first_name: firstName,
      last_name: lastName,
      dob: dateOfBirth
    })
  });

  const data = await response.json();
  
  return {
    verified: data.entity?.verification_status === 'verified',
    matchScore: data.entity?.match_score,
    details: data.entity
  };
};
```

## Cost Comparison (Approximate)

| Provider | NIN Verification | Driver's License | Setup Fee |
|----------|-----------------|------------------|-----------|
| Dojah | ₦50-100/request | ₦100-150/request | Free |
| Youverify | ₦80-120/request | ₦120-180/request | Free |
| Prembly | ₦60-100/request | ₦100-150/request | Free |
| Smile Identity | $0.10-0.20/request | $0.15-0.25/request | Free |

*Prices vary based on volume and subscription tier*

## Implementation Steps

1. **Choose a Provider**: Start with Dojah or Prembly (good pricing, Nigerian focus)
2. **Sign Up**: Create account and get API credentials
3. **Test Environment**: Use sandbox/test mode first
4. **Integrate**: Add verification logic to `/api/admin/user-documents/[id]/route.js`
5. **Store Results**: Save API response in `apiResponse` field
6. **Handle Failures**: Implement fallback to manual verification
7. **Monitor Usage**: Track API calls and costs

## Security Considerations

- Store API keys in environment variables
- Never expose API keys in frontend code
- Log all verification attempts
- Implement rate limiting
- Encrypt sensitive document data
- Comply with NDPR (Nigeria Data Protection Regulation)

## Next Steps

1. **Immediate**: Continue with manual verification
2. **Short-term** (1-2 weeks): Sign up for Dojah/Prembly test account
3. **Medium-term** (1 month): Integrate NIN verification API
4. **Long-term** (3 months): Add driver's license and other document types

## Support Contacts

- **Dojah**: support@dojah.io
- **Youverify**: hello@youverify.co
- **Prembly**: support@prembly.com
- **Smile Identity**: support@usesmileid.com
