// const BASE_URL = 'http://10.0.2.2:3025/api';
const BASE_URL = 'http://139.84.174.38/api';
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
const GET_ARTICLE_BY_ID = `${BASE_URL}/articles`;
const GET_USER_DETAILS_API = `${BASE_URL}/user/getdetails`;
const UPDATE_USER_GENERAL_DETAILS = `${BASE_URL}/user/update-general-details`;
const UPDATE_READ_EVENT = `${BASE_URL}/article/readEvent`;
const UPDATE_USER_PASSWORD = `${BASE_URL}/user/update-password`;
const UPDATE_USER_CONTACT_DETAILS = `${BASE_URL}/user/update-contact-details`;
const UPDATE_USER_PROFESSIONAL_DETAILS = `${BASE_URL}/user/update-professional-details`;
const UPLOAD_STORAGE = `${BASE_URL}/upload-storage`;
const GET_STORAGE_DATA = `${BASE_URL}/getFile`;
const UPDATE_PROFILE_IMAGE = `${BASE_URL}/user/update-profile-image`;
const GET_PROFILE_IMAGE_BY_ID = `${BASE_URL}/user/getprofileimage`;
const GET_IMAGE = `${BASE_URL}/getfile`;
const USER_LOGOUT = `${BASE_URL}/user/logout`;
/** Analytics Part */
const GET_TOTAL_LIKES_VIEWS = `${BASE_URL}/analytics/user-stats/`;
const GET_TOTAL_READS = `${BASE_URL}/analytics/total-reads/`;
const GET_TOTAL_WRITES = `${BASE_URL}/analytics/total-writes/`;
const GET_MOSTLY_VIEWED = `${BASE_URL}/analytics/mostly-viewed/`;
const GET_MONTHLY_READ_REPORT = `${BASE_URL}/analytics/monthly-reads/`;
const GET_YEARLY_READ_REPORT = `${BASE_URL}/analytics/yearly-reads/`;
const GET_MONTHLY_WRITES_REPORT = `${BASE_URL}/analytics/monthly-writes/`;
const GET_YEARLY_WRITES_REPORT = `${BASE_URL}/analytics/yearly-writes/`;

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
  POST_ARTICLE,
  GET_ARTICLE_BY_ID,
  GET_USER_DETAILS_API,
  UPDATE_USER_GENERAL_DETAILS,
  UPDATE_USER_PASSWORD,
  UPDATE_USER_CONTACT_DETAILS,
  UPDATE_USER_PROFESSIONAL_DETAILS,
  UPLOAD_STORAGE,
  GET_STORAGE_DATA,
  UPDATE_PROFILE_IMAGE,
  GET_PROFILE_IMAGE_BY_ID,
  GET_IMAGE,
  USER_LOGOUT,
  UPDATE_READ_EVENT,
  GET_TOTAL_LIKES_VIEWS,
  GET_TOTAL_READS,
  GET_TOTAL_WRITES,
  GET_MOSTLY_VIEWED,
  GET_MONTHLY_READ_REPORT,
  GET_MONTHLY_WRITES_REPORT,
  GET_YEARLY_READ_REPORT,
  GET_YEARLY_WRITES_REPORT,
};
