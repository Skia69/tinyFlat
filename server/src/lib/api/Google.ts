import { google } from 'googleapis';
import { createClient, AddressComponent } from '@google/maps';

// initialize an authUrl object.
const auth = new google.auth.OAuth2(
  process.env.G_CLIENT_ID,
  process.env.G_CLIENT_SECRET,
  `${process.env.PUBLIC_URL}/login`,
);
// initialize a promise based maps client.
const maps = createClient({ key: `${process.env.G_GEOCODE_KEY}`, Promise });

const parseAddress = (addressComponents: AddressComponent[]) => {
  let country = null;
  let admin = null;
  let city = null;

  for (const component of addressComponents) {
    if (component.types.includes('country')) {
      country = component.long_name;
    }

    if (component.types.includes('administrative_area_level_1')) {
      admin = component.long_name;
    }

    if (component.types.includes('locality') || component.types.includes('postal_town')) {
      city = component.long_name;
    }
  }

  return { country, admin, city };
};

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
  geocode: async (address: string) => {
    const res = await maps.geocode({ address }).asPromise();

    if (res.status < 200 || res.status > 299) {
      throw new Error('failed to geocode address');
    }
    // extract the country, admin & city from the returned data.
    return parseAddress(res.json.results[0].address_components);
  },
};
