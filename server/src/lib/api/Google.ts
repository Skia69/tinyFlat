import { google } from 'googleapis';

// build the authUrl object.
const auth = new google.auth.OAuth2(
    process.env.G_CLIENT_ID,
    process.env.G_CLIENT_SECRET,
    `${process.env.PUBLIC_URL}/login`,
);

export const Google = {
    // eslint-disable-next-line @typescript-eslint/camelcase
    authUrl: auth.generateAuthUrl({
        access_type: 'online',
        scope: [
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
        ],
    }),
    // make a request to Google using a "code" argument to get a user's access token.
    logIn: async (code: string) => {
        // access_token and refresh_token.
        const { tokens } = await auth.getToken(code);
        // set the auth credentials.
        auth.setCredentials(tokens);
        // make a request to Google's People API to get the user information we'll need.
        const { data } = await google.people({ version: 'v1', auth }).people.get({
            resourceName: 'people/me',
            personFields: 'emailAddresses,names,photos',
        });

        return { user: data };
    },
};
