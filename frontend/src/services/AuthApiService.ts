import {BASE_URL, LOGIN_API, REGISTRATION_API} from '../helper/APIUtils';
import {
  postMethodCall,
  postMethodCallwithToken,
  getMethodCall,
  getMethodCallwithToken,
} from '../helper/CallAPI';
import {LoginUser, UserModel} from '../models/User';
import axios from 'axios';

/** The purpose of this class is to store all auth-related methods
 * which are connected with API,  together in one place */

export class AuthApiService {
  constructor() {}

  /** Add Function to call login api */

  login(params: LoginUser) {
    return new Promise((resolve, reject) => {
      const url = BASE_URL + LOGIN_API;
      console.log('Url', url);
      postMethodCall(url, params)
        .then((response: any) => {
          console.log('Enter');
          if (response.status === 403) {
            reject(new Error('Email not verified. Please check your email.'));
          }

          //   console.log("Response", response.json());
          // Check for error in response (modify based on actual format)
          // if (response.error) {

          //} else {
          else {
            resolve(response); // Assuming successful response has user data
          }
        })
        .catch((err: Error) => {
          console.log('Error', err);
          reject(err);
        });
    });
  }

  /** Add Function to call register api */

  // Issue 115 : Step 1: Complete the function

  register(params: UserModel) {
    return new Promise((resolve, reject) => {
      // return new promises with  postMethodCall(url,params)
      let url = BASE_URL + REGISTRATION_API;
    });
    // Remember this is an initial abstraction, if you faces any difficulties you can suggest your own
    // And if you familiar with it then okay
  }
}
