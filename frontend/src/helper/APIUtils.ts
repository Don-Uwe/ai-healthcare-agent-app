const BASE_URL = 'http://192.168.0.101:3025/api';
const LOGIN_API = `${BASE_URL}/user/login`;
const REGISTRATION_API = `${BASE_URL}/user/register`;
const ARTICLE_TAGS_API = '/articles/tags';
const GET_PROFILE_API = `${BASE_URL}/user/getprofile`;
const VERIFICATION_MAIL_API = `${BASE_URL}/user/verifyEmail`;
const RESEND_VERIFICATION = `${BASE_URL}/user/resend-verification-mail`;
const SEND_OTP = `${BASE_URL}/user/forgotpassword`;
const CHECK_OTP = `${BASE_URL}/user/verifyOtp`;
const CHANGE_PASSWORD_API = `${BASE_URL}/user/verifypassword`;
const REFRESH_TOKEN_API = `${BASE_URL}/user/refreshToken`;
const FOLLOW_USER = `${BASE_URL}/user/follow`;
const UPDATE_VIEW_COUNT = `${BASE_URL}/articles/updateViewCount`;
const SAVE_ARTICLE = `${BASE_URL}/articles/saveArticle`;
const LIKE_ARTICLE = `${BASE_URL}/articles/likeArticle`;
const POST_ARTICLE = `${BASE_URL}/articles`;



export {
  BASE_URL,
  LOGIN_API,
  REGISTRATION_API,
  ARTICLE_TAGS_API,
  GET_PROFILE_API,
  VERIFICATION_MAIL_API,
  RESEND_VERIFICATION,
  SEND_OTP,
  CHECK_OTP,
  CHANGE_PASSWORD_API,
  REFRESH_TOKEN_API,
  FOLLOW_USER,
  UPDATE_VIEW_COUNT,
  SAVE_ARTICLE,
  LIKE_ARTICLE,
  POST_ARTICLE
};
