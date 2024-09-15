export const BASE_URL = 'http://192.168.0.101:3025/api';
export const LOGIN_API = `${BASE_URL}/user/login`;
export const REGISTRATION_API = `${BASE_URL}/user/register`;
export const ARTICLE_TAGS_API = '/articles/tags';
export const GET_PROFILE_API = '/user/getprofile';
export const VERIFICATION_MAIL_API = `${BASE_URL}/user/verifyEmail`;
export const RESEND_VERIFICATION = `${BASE_URL}/user/resend-verification-mail`;
export const SEND_OTP = `${BASE_URL}/user/forgotpassword`;
export const CHECK_OTP = `${BASE_URL}/user/verifyOtp`;
export const CHANGE_PASSWORD_API = `${BASE_URL}/user/verifypassword`;

export const REFRESH_TOKEN_API = `${BASE_URL}/user/refreshToken`;
