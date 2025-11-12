
import {GaxiosOptions, GaxiosPromise, request} from 'gaxios';

// Transporter needed in GoogleToken to make request.
interface Transporter {
  request<T>(opts: GaxiosOptions): GaxiosPromise<T>;
}

// Interface presenting the option for GoogleToken.
interface TokenOptions {
  /**
   * Path to a .json, .pem, or .p12 key file.
   */
  keyFile?: string;
  /**
   * The raw private key value.
   */
  key?: string;
  /**
   * The service account email address.
   */
  email?: string;
  /**
   * The issuer claim for the JWT.
   */
  iss?: string;
  /**
   * The subject claim for the JWT. This is used for impersonation.
   */
  sub?: string;
  /**
   * The space-delimited list of scopes for the requested token.
   */
  scope?: string | string[];
  /**
   * Additional claims to include in the JWT payload.
   */
  additionalClaims?: {};
  /**
   * Eagerly refresh unexpired tokens when they are within this many
   * milliseconds from expiring.
   * Defaults to 0.
   */
  eagerRefreshThresholdMillis?: number;
  
  transporter?: Transporter;
}

class GoogleToken {
  private tokenOptions: TokenOptions;

  /**
   * Create a GoogleToken.
   *
   * @param options  Configuration object.
   */
  constructor(options?: TokenOptions) {
    this.tokenOptions = options || {};
    // If transporter is not set, by default set Gaxios.request.
    if (!this.tokenOptions.transporter) {
      this.tokenOptions.transporter = {
        request: opts => request(opts),
      };
    }
  }

  get getTokenOptions(): TokenOptions {
    return this.tokenOptions;
  }
}

export { GoogleToken, Transporter, TokenOptions };