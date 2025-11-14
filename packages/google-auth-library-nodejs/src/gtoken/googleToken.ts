
import {request} from 'gaxios';
import { TokenOptions, Transporter } from './tokenOptions';
import { TokenHandler } from './tokenHandler';
import { revokeToken } from './revokeToken';
import { TokenData } from './getToken';

export interface GetTokenOptions {
  forceRefresh?: boolean;
}

export type GetTokenCallback = (err: Error | null, token?: TokenData) => void;

class GoogleToken {
  private tokenOptions: TokenOptions;
  private tokenHandler: TokenHandler;

  /**
   * Create a GoogleToken.
   *
   * @param options  Configuration object.
   */
  constructor(options?: TokenOptions) {
    this.tokenOptions = options || {};
    // If transporter is not set, by default set Gaxios.request.
    if(this.tokenOptions) {
      this.tokenOptions.transporter = this.tokenOptions.transporter || {
        request: opts => request(opts),
      };
    }
    this.tokenHandler = new TokenHandler(this.tokenOptions);
  }

  /**
   * Returns the access token.
   */
  get accessToken(): string | undefined {
    return this.tokenHandler.token?.access_token;
  }

  /**
   * Returns the ID token.
   */
  get idToken(): string | undefined {
    return this.tokenHandler.token?.id_token;
  }

  /**
   * Returns the token type.
   */
  get tokenType(): string | undefined {
    return this.tokenHandler.token?.token_type;
  }

  /**
   * Returns the refresh token.
   */
  get refreshToken(): string | undefined {
    return this.tokenHandler.token?.refresh_token;
  }

  /**
   * Returns true if the token has expired.
   */
  hasExpired(): boolean {
    return this.tokenHandler.hasExpired();
  }

  /**
   * Returns true if the token is expiring soon.
   */
  isTokenExpiring(): boolean {
    return this.tokenHandler.isTokenExpiring();
  }

  /**
   * Fetches a new access token.
   * @param opts Options for fetching the token.
   */
  getToken(opts?: GetTokenOptions): Promise<TokenData>;
  getToken(callback: GetTokenCallback, opts?: GetTokenOptions): void;
  getToken(
    callbackOrOptions?: GetTokenCallback | GetTokenOptions,
    opts: GetTokenOptions = {forceRefresh: false}
  ): void | Promise<TokenData> {
    let callback: GetTokenCallback | undefined;
    if (typeof callbackOrOptions === 'function') {
      callback = callbackOrOptions;
    } else if (typeof callbackOrOptions === 'object') {
      opts = callbackOrOptions;
    }

    const promise = this.tokenHandler.getToken(opts.forceRefresh ?? false);

    if (callback) {
      promise.then(token => callback(null, token), callback);
    }
    return promise;
  }

  /**
   * Revokes the current access token.
   */
  revokeToken(): Promise<void>;
  revokeToken(callback: (err?: Error) => void): void;
  revokeToken(callback?: (err?: Error) => void): void | Promise<void> {
    const promise = this.accessToken
      ? revokeToken(this.accessToken, this.tokenOptions.transporter as Transporter)
      : Promise.reject(new Error('No token to revoke.'));

    if (callback) {
      promise.then(() => callback(), callback);
    }
    return promise;
  }

  get googleTokenOptions(): TokenOptions {
    return this.tokenOptions;
  }
}

export { GoogleToken, Transporter, TokenOptions, TokenData };