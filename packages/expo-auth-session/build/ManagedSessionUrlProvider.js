import Constants from 'expo-constants';
import qs from 'qs';
const { manifest } = Constants;
export class ManagedSessionUrlProvider {
    getDefaultReturnUrl() {
        let scheme = 'exp';
        let path = ManagedSessionUrlProvider.SESSION_PATH;
        let manifestScheme = manifest.scheme || (manifest.detach && manifest.detach.scheme);
        if (Constants.appOwnership === 'standalone' && manifestScheme) {
            scheme = manifestScheme;
        }
        else if (Constants.appOwnership === 'standalone' && !manifestScheme) {
            throw new Error('Cannot make a deep link into a standalone app with no custom scheme defined');
        }
        else if (Constants.appOwnership === 'expo' && !manifestScheme) {
            console.warn('Linking requires that you provide a `scheme` in app.json for standalone apps - if it is left blank, your app may crash. The scheme does not apply to development in the Expo client but you should add it as soon as you start working with Linking to avoid creating a broken build. Add a `scheme` to silence this warning. Learn more about Linking at https://docs.expo.io/versions/latest/workflow/linking/');
        }
        let hostUri = ManagedSessionUrlProvider.HOST_URI || '';
        if (ManagedSessionUrlProvider.USES_CUSTOM_SCHEME && ManagedSessionUrlProvider.IS_EXPO_HOSTED) {
            hostUri = '';
        }
        if (path) {
            if (ManagedSessionUrlProvider.IS_EXPO_HOSTED && hostUri) {
                path = `/--/${ManagedSessionUrlProvider.removeLeadingSlash(path)}`;
            }
            if (!path.startsWith('/')) {
                path = `/${path}`;
            }
        }
        else {
            path = '';
        }
        hostUri = ManagedSessionUrlProvider.removeTrailingSlash(hostUri);
        return encodeURI(`${scheme}://${hostUri}${path}`);
    }
    getStartUrl(authUrl, returnUrl) {
        let queryString = qs.stringify({
            authUrl,
            returnUrl,
        });
        return `${this.getRedirectUrl()}/start?${queryString}`;
    }
    getRedirectUrl() {
        const redirectUrl = `${ManagedSessionUrlProvider.BASE_URL}/${manifest.id}`;
        if (__DEV__) {
            ManagedSessionUrlProvider.warnIfAnonymous(manifest.id, redirectUrl);
        }
        return redirectUrl;
    }
    static getHostUri() {
        let hostUri = manifest.hostUri;
        if (!hostUri && !ManagedSessionUrlProvider.USES_CUSTOM_SCHEME) {
            // we're probably not using up-to-date xdl, so just fake it for now
            // we have to remove the /--/ on the end since this will be inserted again later
            hostUri = ManagedSessionUrlProvider.removeScheme(Constants.linkingUri).replace(/\/--(\/.*)?$/, '');
        }
        return hostUri;
    }
    static warnIfAnonymous(id, url) {
        if (id.startsWith('@anonymous/')) {
            console.warn(`You are not currently signed in to Expo on your development machine. As a result, the redirect URL for AuthSession will be "${url}". If you are using an OAuth provider that requires whitelisting redirect URLs, we recommend that you do not whitelist this URL -- instead, you should sign in to Expo to acquired a unique redirect URL. Additionally, if you do decide to publish this app using Expo, you will need to register an account to do it.`);
        }
    }
    static removeScheme(url) {
        return url.replace(/^[a-zA-Z0-9+.-]+:\/\//, '');
    }
    static removeLeadingSlash(url) {
        return url.replace(/^\//, '');
    }
    static removeTrailingSlash(url) {
        return url.replace(/\/$/, '');
    }
}
ManagedSessionUrlProvider.BASE_URL = `https://auth.expo.io`;
ManagedSessionUrlProvider.SESSION_PATH = 'expo-auth-session';
ManagedSessionUrlProvider.USES_CUSTOM_SCHEME = Constants.appOwnership === 'standalone' && manifest.scheme;
ManagedSessionUrlProvider.HOST_URI = ManagedSessionUrlProvider.getHostUri();
ManagedSessionUrlProvider.IS_EXPO_HOSTED = ManagedSessionUrlProvider.HOST_URI &&
    (/^(.*\.)?(expo\.io|exp\.host|exp\.direct|expo\.test)(:.*)?(\/.*)?$/.test(ManagedSessionUrlProvider.HOST_URI) ||
        manifest.developer);
//# sourceMappingURL=ManagedSessionUrlProvider.js.map