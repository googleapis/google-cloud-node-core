import { getToken, TokenData } from './getToken';
import { TokenOptions, Transporter } from './tokenOptions';
import { getCredentials, Credentials } from './getCredentials';

class TokenHandler {
    public token: TokenData | undefined;
    public tokenExpiresAt: number | undefined;
    private inFlightRequest: Promise<TokenData> | undefined;
    private transporter: Transporter;
    private tokenOptions: TokenOptions;

    constructor(tokenOptions: TokenOptions, transporter: Transporter) {
        this.tokenOptions = tokenOptions;
        this.transporter = transporter;
    }

    private async processCredentials() {
        if (!this.tokenOptions.key && !this.tokenOptions.keyFile) {
            throw new Error('No key or keyFile set.');
        }
        if (!this.tokenOptions.key && this.tokenOptions.keyFile) {
            const credentials: Credentials = await getCredentials(this.tokenOptions.keyFile);
            this.tokenOptions.key = credentials.privateKey;
            this.tokenOptions.email = credentials.clientEmail;
        }
    }

    isTokenExpiring(): boolean {
        if (this.token && this.tokenExpiresAt) {
            const now = new Date().getTime();
            const eagerRefreshThresholdMillis = this.tokenOptions.eagerRefreshThresholdMillis ?? 0;
            return this.tokenExpiresAt <= now + eagerRefreshThresholdMillis;
        }
        return true;
    }

    async getToken(forceRefresh: boolean): Promise<TokenData> {
        await this.processCredentials();
        if (this.inFlightRequest && !forceRefresh) {
            return this.inFlightRequest;
        }
        if (this.token && !this.isTokenExpiring() && !forceRefresh) {
            return this.token;
        }
        try {
            return await (this.inFlightRequest = getToken(this.tokenOptions, this.transporter));
        } finally {
            this.inFlightRequest = undefined;
        }
    }
}

export { TokenHandler };