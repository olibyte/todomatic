# Goalie - Agile Life Management

Goalie is a life management application designed to help you with your tasks and chores. It allows users to manage their tasks, assign points, and track their progress, gamifying life administration. Users can create lists, add tasks, and complete them to earn rewards. You can even share lists with friends to collaborate or compete!

## Features

- **User Authentication**: Secure user authentication using AWS Cognito.
- **Task Management**: Create, read, update, and delete tasks.
- **List Management**: Organize tasks into lists.
- **Gamification**: Assign points to tasks and track progress.
- **Competitions**: Treat each list as a competition (or collab) and reward users for completing tasks.

## Tech Stack

- **Frontend**: React
- **Backend**: AWS Lambda, API Gateway, DynamoDB
- **Authentication**: AWS Cognito
- **CI/CD**: AWS CodePipeline & S3

## Getting Started

### Prerequisites

- Node.js
- AWS Account

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/goalie.git
   cd goalie
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up AWS resources**

   - **Cognito User Pool**: Create a Cognito User Pool for authentication.
   - **DynamoDB Tables**: Create `Lists` and `Tasks` tables with appropriate schema.
   - **API Gateway**: Set up API Gateway to handle requests.
   - **Lambda Functions**: Deploy Lambda functions for CRUD operations (I wrote mine in Python).
   - **Codepipeline**: Set up CI/CD pipeline connected to GitHub and S3 (optional)

### Configuration

1. **AWS Configuration**

   Create a file named `aws-config.js` in the `src` directory with the following content:

   ```javascript
   const awsConfig = {
     Region: 'your-region',
     UserPoolId: 'your-user-pool-id',
     ClientId: 'your-client-id',
     IdentityPoolId: 'your-identity-pool-id',
   };

   export default awsConfig;
   ```

2. **Environment Variables**

   Set up your environment variables for AWS credentials and configurations.

### Running the Application

1. **Start the development server**

   ```bash
   npm start
   ```

2. **Open the application**

   Open your browser and navigate to `http://localhost:3000`.


## API Endpoints

### Lists

- **GET** `/lists?userId={userId}` - Fetch all lists for a user.
- **POST** `/lists` - Create a new list.
- **PUT** `/lists` - Update an existing list.
- **DELETE** `/lists` - Delete a list.

### Tasks

- **GET** `/tasks?ListId={ListId}` - Fetch all tasks for a list.
- **POST** `/tasks` - Create a new task.
- **PUT** `/tasks` - Update an existing task.
- **DELETE** `/tasks` - Delete a task.

## Contributing

Wanna contribute? Simply open an issue or submit a pull request if you have any improvements or bug fixes.

## License

This project is licensed under the MIT License.
