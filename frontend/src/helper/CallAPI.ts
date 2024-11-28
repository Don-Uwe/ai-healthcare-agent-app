

/**
 *
 * @param url
 *
 *
 * @param params
 * @param authToken
 * @returns
 */

/**
 *
 The purpose of this interface is to give an initial abstraction over all types of API calls, (POST, GET, UPDATE, and DELETE)
 with specific header items (for example token) and also  without specific header items
 */

/** Post Method call with Authtoken */
export function postMethodCallwithToken(
  url: string,
  params: any,
  authToken: string,
): Promise<any> {
  return new Promise<any>((resolve, error) => {
    fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'cache-control': 'no-cache',
        Authorization: `Bearer ${authToken}`, // Add the authorization header
      },
      body: JSON.stringify(params),
    })
      .then(response => response.json())
      .then(responseJson => {
        resolve(responseJson);
      })
      .catch(er => {
        error(er);
      });
  });
}

/** Simple Postmethod call */

export function postMethodCall(url: string, params: any): Promise<any> {
  return new Promise<any>((resolve, error) => {
    fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })
      .then(response => response.json())
      .then(responseJson => {
        resolve(responseJson);
        //console.log('Response JSON', responseJson);
      })
      .catch(er => {
        error(er);
      });
  });
}

/** Get Method Call with auth token  */

export function getMethodCallwithToken(
  url: string,
  authToken: string,
): Promise<any> {
  return new Promise((resolve, error) => {
    fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`, // Add the auth token to the headers
      },
    })
      .then(response => response.json())
      .then(responseJson => {
        resolve(responseJson);
      })
      .catch(er => {
        error(er);
        //console.log('Get Method Error', er);
      });
  });
}

/** Simple Get method call */

export function getMethodCall(url: string): Promise<any> {
  return new Promise((resolve, error) => {
    fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(responseJson => {
        resolve(responseJson);
      })
      .catch(er => {
        error(er);
        //console.log('Get Method Error', er);
      });
  });
}
