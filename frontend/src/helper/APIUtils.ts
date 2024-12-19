//const EC2_BASE_URL = 'http://localhost:8080/api';
//const EC2_BASE_URL = 'http://10.0.2.2:8081/api';
//const EC2_BASE_URL = 'http://139.84.174.38/api';
const EC2_BASE_URL = 'http://51.20.1.81:8081/api';
//const EC2_BASE_URL = 'http://139.84.174.38/api';
const LOGIN_API = `${EC2_BASE_URL}/user/login`;
const REGISTRATION_API = `${EC2_BASE_URL}/user/register`;
const ARTICLE_TAGS_API = '/articles/tags';
const GET_PROFILE_API = `${EC2_BASE_URL}/user/getprofile`;
const VERIFICATION_MAIL_API = `${EC2_BASE_URL}/user/verifyEmail`;
const RESEND_VERIFICATION = `${EC2_BASE_URL}/user/resend-verification-mail`;
const SEND_OTP = `${EC2_BASE_URL}/user/forgotpassword`;
const CHECK_OTP = `${EC2_BASE_URL}/user/verifyOtp`;
const CHANGE_PASSWORD_API = `${EC2_BASE_URL}/user/verifypassword`;
const REFRESH_TOKEN_API = `${EC2_BASE_URL}/user/refreshToken`;
const FOLLOW_USER = `${EC2_BASE_URL}/user/follow`;
const UPDATE_VIEW_COUNT = `${EC2_BASE_URL}/articles/updateViewCount`;
const SAVE_ARTICLE = `${EC2_BASE_URL}/articles/saveArticle`;
const LIKE_ARTICLE = `${EC2_BASE_URL}/articles/likeArticle`;
const POST_ARTICLE = `${EC2_BASE_URL}/articles`;
const GET_ARTICLE_BY_ID = `${EC2_BASE_URL}/articles`;
const GET_USER_DETAILS_API = `${EC2_BASE_URL}/user/getdetails`;
const UPDATE_USER_GENERAL_DETAILS = `${EC2_BASE_URL}/user/update-general-details`;
const UPDATE_READ_EVENT = `${EC2_BASE_URL}/article/readEvent`;
const UPDATE_USER_PASSWORD = `${EC2_BASE_URL}/user/update-password`;
const UPDATE_USER_CONTACT_DETAILS = `${EC2_BASE_URL}/user/update-contact-details`;
const UPDATE_USER_PROFESSIONAL_DETAILS = `${EC2_BASE_URL}/user/update-professional-details`;
const UPLOAD_STORAGE = `${EC2_BASE_URL}/upload-storage`;
const GET_STORAGE_DATA = `${EC2_BASE_URL}/getFile`;
const UPDATE_PROFILE_IMAGE = `${EC2_BASE_URL}/user/update-profile-image`;
const GET_PROFILE_IMAGE_BY_ID = `${EC2_BASE_URL}/user/getprofileimage`;
const GET_IMAGE = `${EC2_BASE_URL}/getfile`;
const USER_LOGOUT = `${EC2_BASE_URL}/user/logout`;
/** Analytics Part */
const GET_TOTAL_LIKES_VIEWS = `${EC2_BASE_URL}/analytics/user-stats/`;
const GET_TOTAL_READS = `${EC2_BASE_URL}/analytics/total-reads/`;
const GET_TOTAL_WRITES = `${EC2_BASE_URL}/analytics/total-writes/`;
const GET_MOSTLY_VIEWED = `${EC2_BASE_URL}/analytics/mostly-viewed/`;
const GET_MONTHLY_READ_REPORT = `${EC2_BASE_URL}/analytics/monthly-reads/`;
const GET_YEARLY_READ_REPORT = `${EC2_BASE_URL}/analytics/yearly-reads/`;
const GET_MONTHLY_WRITES_REPORT = `${EC2_BASE_URL}/analytics/monthly-writes/`;
const GET_YEARLY_WRITES_REPORT = `${EC2_BASE_URL}/analytics/yearly-writes/`;

const VULTR_CHAT_URL = 'https://api.vultrinference.com/v1/chat/completions';

export {
  EC2_BASE_URL,
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
  VULTR_CHAT_URL,
};
