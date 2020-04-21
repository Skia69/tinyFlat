import { IResolvers } from 'apollo-server-express';
import { Google } from './../../../lib/api/Google';
import crypto from 'crypto';
import { Viewer, Database, User } from './../../../lib/types';
import { logInArgs } from './types';

const logInViaGoogle = async (
    code: string,
    token: string,
    db: Database,
): Promise<User | undefined> => {
    // "user" is a very complex object received from the People api.
    const { user } = await Google.logIn(code);

    if (!user) {
        throw new Error('Google login error');
    }
    // extract the necessary user information out of the People api.
    const userNamesList = user.names ?? []; // Names
    const userPhotosList = user.photos ?? []; // Photos
    const userEmailsList = user.emailAddresses ?? []; // Emails

    const userName = userNamesList[0]?.displayName; // User Display Name
    const userId = userNamesList[0]?.metadata?.source?.id; // User Id
    const userAvatar = userPhotosList[0]?.url; // User Avatar
    const userEmail = userEmailsList[0]?.value; // User Email

    if (!userId || !userName || !userAvatar || !userEmail) {
        throw new Error('Google login error');
    }
    // update the user with the Google data in case it already exists in the database.
    const updateResult = await db.users.findOneAndUpdate(
        { _id: userId },
        {
            $set: {
                name: userName,
                avatar: userAvatar,
                contact: userEmail,
                token,
            },
        }, // return the updated document.
        { returnOriginal: false },
    );
    // create a new user in case it doesn't exist in the database.
    let viewer = updateResult.value;

    if (!viewer) {
        const insertResult = await db.users.insertOne({
            _id: userId,
            name: userName,
            avatar: userAvatar,
            contact: userEmail,
            token,
            income: 0,
            bookings: [],
            listings: [],
        });

        viewer = insertResult.ops[0];
    }
    /* 
    return the user that's either already in the databse and has been updated,
    or the one that's been just created.
    */
    return viewer;
};

export const viewerResolvers: IResolvers = {
    Query: {
        authUrl: () => {
            try {
                return Google.authUrl;
            } catch (error) {
                throw new Error(`Failed to query Google Auth Url: ${error}`);
            }
        },
    },

    Mutation: {
        /* the logIn function will return a "viewer" which is a custom/modified "user" object,
        where as the logInViaGoogle function will return the actual "user" object,
        we follow this technique because we don't wanna expose sensitive data. */
        logIn: async (
            _root: undefined,
            { input }: logInArgs,
            { db }: { db: Database },
        ): Promise<Viewer> => {
            try {
                // extract the code when the user will have been redirected to the Google consent form.
                const code = input?.code;
                // generate a token which will be sent to the client and will eventually be used to authorize the incoming requests.
                const token = crypto.randomBytes(16).toString('hex');
                /* custom logIn function with a return value that's to be stored in a "viewer" variable.
                it will only fire if the viewer has actually been redirected to the Google consent form and thus received a code. */
                const viewer: User | undefined = code
                    ? await logInViaGoogle(code, token, db)
                    : undefined;
                // we'll inform the client that someone is viewing our app even if they didn't login.
                if (!viewer) {
                    return { didRequest: true };
                }
                // send the viewer info to the client in case they login.
                return {
                    _id: viewer._id,
                    token: viewer.token,
                    avatar: viewer.avatar,
                    walletId: viewer.walletId,
                    didRequest: true,
                };
            } catch (error) {
                throw new Error(`Failed to log in: ${error}`);
            }
        },
        logOut: (): Viewer => {
            try {
                return { didRequest: true };
            } catch (error) {
                throw new Error(`Failed to log out: ${error}`);
            }
        },
    },

    Viewer: {
        // "id" from the People api which is to resolved into "_id" for the Mongodb.
        id: (viewer: Viewer) => viewer._id,
        // "walletId" is a sensitive info which is why we substitute it with "hasWallet" when sending it to the client.
        hasWallet: (viewer: Viewer) => (viewer.walletId ? true : false),
    },
};
