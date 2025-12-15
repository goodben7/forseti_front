import { Client, cacheExchange, fetchExchange } from 'urql';
import { authExchange } from '@urql/exchange-auth';
import https from 'https';

// Custom fetch for development to handle self-signed certificates
const customFetch = (url: RequestInfo | URL, options?: RequestInit) => {
    if (process.env.NODE_ENV === 'development') {
        // Create HTTPS agent that ignores certificate errors in development
        const agent = new https.Agent({
            rejectUnauthorized: false,
        });

        return fetch(url, {
            ...options,
            // @ts-ignore - agent is valid but not in the type definition
            agent,
        });
    }
    return fetch(url, options);
};

const getAuth = async ({ authState }: any) => {
    if (!authState) {
        const token = localStorage.getItem('authToken');
        if (token) {
            return { token };
        }
        return null;
    }
    return null;
};

const addAuthToOperation = ({ authState, operation }: any) => {
    if (!authState || !authState.token) {
        return operation;
    }

    const fetchOptions =
        typeof operation.context.fetchOptions === 'function'
            ? operation.context.fetchOptions()
            : operation.context.fetchOptions || {};

    return {
        ...operation,
        context: {
            ...operation.context,
            fetchOptions: {
                ...fetchOptions,
                headers: {
                    ...fetchOptions.headers,
                    Authorization: `Bearer ${authState.token}`,
                },
            },
        },
    };
};

const didAuthError = ({ error }: any) => {
    return error.graphQLErrors.some(
        (e: any) => e.extensions?.code === 'UNAUTHENTICATED'
    );
};

const willAuthError = ({ authState }: any) => {
    if (!authState) return true;
    return false;
};

export const createGraphQLClient = () => {
    const apiUrl = process.env.NEXT_PUBLIC_GRAPHQL_API_URL || 'https://127.0.0.1:8000/api/graphql';

    return new Client({
        url: apiUrl,
        exchanges: [
            cacheExchange,
            authExchange(async (utilities) => {
                return {
                    addAuthToOperation(operation) {
                        const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
                        if (!token) return operation;

                        return utilities.appendHeaders(operation, {
                            Authorization: `Bearer ${token}`,
                        });
                    },
                    didAuthError(error) {
                        return error.graphQLErrors.some(
                            (e) => e.extensions?.code === 'UNAUTHENTICATED'
                        );
                    },
                    async refreshAuth() {
                        // Optional: implement token refresh logic here
                    },
                };
            }),
            fetchExchange,
        ],
        fetch: customFetch,
        fetchOptions: () => {
            return {
                headers: {
                    'Content-Type': 'application/json',
                },
            };
        },
    });
};

export const graphqlClient = createGraphQLClient();
