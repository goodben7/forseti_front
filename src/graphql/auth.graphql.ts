// GraphQL Authentication Mutations and Queries

export const LOGIN_MUTATION = `
  mutation Login($input: loginAuthTokenInput!) {
    loginAuthToken(input: $input) {
      authToken {
        token
      }
    }
  }
`;

export const GET_CURRENT_USER_QUERY = `
  query GetCurrentUser {
    me {
      id
      email
      username
    }
  }
`;

// TypeScript types for authentication
export interface LoginResponse {
    loginAuthToken: {
        authToken: {
            token: string;
        };
    };
}

export interface User {
    id: string;
    email: string;
    username: string;
}

export interface LoginVariables {
    input: {
        username: string;
        password: string;
    };
}
