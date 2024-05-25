# UltimateHealth

## About:

UltimateHealth is an innovative open-source project that aims to provide a comprehensive online library and article management application focused on health. The project is designed to cater to users looking for reliable and trustworthy information on various health-related topics.

## Features:

From the beginner's perspective, the]is project consists of three main modules: Article Section, Chat Section, and Podcasts. The Article Section includes:

* Diseases-related information
* General health-related guidance
* Survival experiences from critical diseases
* Backend Development

Users can also listen to articles(audio features) if they prefer. The Chat Section features a guide bot that helps users solve health-related problems.  


Hello! Congratulations to all the GSSOC'24 contributors and mentors!🎉
I'm thrilled to be a part of this amazing team and excited to work together to make the Ultimate Health project a huge success. Let's collaborate, learn, and grow together!

## Getting Started:

Follow these steps to get started with UltimateHealth:

**Clone the repository:**

```
https://github.com/SB2318/UltimateHealth.git

cd  UltimateHealth

```


**Checkout the develop branch and select your preferences (backend or frontend)**.

```
 git checkout develop
```

## For Frontend:


**Install dependencies:**

```
npm install --legacy-peer-deps
```

**Configure the application: (For IOS and Backend)**

Update the configuration files if necessary. Ensure the Ethereum wallet connection details are set.


**Run the applications**.

To run the frontend server use:
 
For android:
`npm run android`

For ios: 
`npm run ios`

## For Backend:

## MongoDB Installation

1. **Install MongoDB**
   - Download the appropriate MongoDB installation package for your operating system from the official MongoDB website: https://www.mongodb.com/try/download
   - Follow the installation instructions for your specific platform.

2. **Set up a MongoDB database**
   - After installation, start the MongoDB server by running the `mongod` command.
   - MongoDB will create a default data directory to store your databases.
   - Use the `mongo` shell or a GUI client like MongoDB Compass to interact with your databases.

3. **Follow the Steps to Initialize the backend server**

## Setting up a Backend Server

Follow the steps to set backend in your system

```
 cd backend
```
Create .env file if not present and add the following variables in the file

```
PORT=
MONGODB_URL=""
JWT_SECRET=""
```

**Install necessary dependency from package.json**

`npm install -s`

**Once dependencies are installed, run the server using the following command**

`npm run dev`

Alternate Command to run the server once

`node server.js`

**Backend API URL**
```
 http://localhost:{PORT}/api/
```
**Make Sure to replace the proper PORT value for Backend API**

**Access the application:**
Open your web browser and navigate to (LOCAL_HOST_URL).
If you would like to contribute to the project, please follow the contribution guidelines.

## Testing Frontend with Localhost Backend Server

When working with a backend server running on localhost, frontend developers can follow these guidelines to test their application:

1. **Start the backend server**
   - Before testing the frontend application, ensure that the backend server is running on localhost.
   - Navigate to the backend project directory and start the server (e.g., `node server.js` for a Node.js server).
   - The server should be listening on a specific port (e.g., `http://localhost:{PORT}`).

2. **Configure the frontend application**
   - In the frontend application, locate the configuration file or the section where the API base URL is defined.
   - Set the API base URL to point to the local backend server.

3. **Use appropriate HTTP clients**
   - During development, frontend developers can use browser tools like the Network tab in the developer tools or dedicated HTTP clients like Postman or Insomnia to test the backend API endpoints.
   - Send HTTP requests to the local backend server and observe the responses.

4. **Handle CORS (Cross-Origin Resource Sharing)**
   - If the frontend application is running on a different port or domain than the backend server, the browser may block the requests due to CORS restrictions.
   - To handle CORS, the backend server should be configured to allow cross-origin requests from the frontend application's origin.
   - CORS is handled in the current backend server

5. **Proxy requests (optional)**
   - Some frontend frameworks (e.g., Create React App, Vue CLI) provide a built-in proxy feature that forwards requests from the frontend application to the backend server.
   - Configure the proxy in the frontend application's development settings to automatically forward API requests to the local backend server.

6. **Use environment variables**
   - Avoid hardcoding the backend server URL in the frontend application.
   - Instead, use environment variables to store the backend server URL and read it during runtime.

7. **Test different scenarios**
   - Test various user flows and interactions with the backend API, such as creating, reading, updating, and deleting data.
   - Simulate different scenarios, including error cases and edge cases, to ensure the frontend application and backend server handle them correctly.

**Access the application:**
Open your web browser and navigate to (LOCAL_HOST_URL).
If you would like to contribute to the project, please follow the contribution guidelines.

## Contribution Guidelines:

* **Checkout and make your changes for the develop branch only:** When working on your contributions, switch to the **develop** branch in your local repository. This ensures that you are working on the latest version of the codebase.

* **Create pull requests only for the develop branch:** When you are ready to submit your changes, create a pull request (PR) targeting the **develop** branch. This allows the maintainers to review and merge your code into the main development branch.

* **Maintain contribution guidelines:** Each project may have its specific contribution guidelines. It's important to familiarize yourself with these guidelines before submitting your contributions. Adhering to these guidelines ensures consistency and helps maintain the quality of the codebase.

* **Format your commit message with the issue number:** When making commits related to an issue, follow the format **Fixes: #32 in your commit message. Replace 32 with the issue number you are addressing.** This helps track and manage issues more efficiently.

* **Attach a Postman response screenshot for backend tasks:** For tasks related to the backend, it is recommended to include a screenshot of the Postman response along with your pull request. This provides additional context and helps reviewers understand the changes made and their impact on the backend functionality.

* **Make your pull request descriptive and include examples:** When creating a pull request, provide a clear and descriptive explanation of the changes you made. This helps reviewers understand the purpose and significance of your contribution. Additionally, including at least one example that demonstrates the intended usage or effect of your changes can be beneficial.

* **Rebase your commits and optimize file changes:** When submitting your pull request, consider rebasing your commits into one commit and optimizing your file changes. This helps keep the commit history clean and makes it easier for reviewers to understand your changes.

Remember, following these guidelines will help ensure a smooth and efficient contribution process. Happy coding!
    
## Contact:
     
Discord Server (Susmita Bhattacharya, user_name: susmita_)

<h2 align = "center">Our Contributors ❤️</h2>
<div align = "center">
 <h3>Thank you for contributing to our repository</h3>

![Contributors](https://contrib.rocks/image?repo=SB2318/UltimateHealth)


</div>
