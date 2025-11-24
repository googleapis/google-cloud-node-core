import {request} from 'gaxios';
import {TokenOptions, Transporter} from './tokenOptions';

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

  get googleTokenOptions(): TokenOptions {
    return this.tokenOptions;
  }
}

export {GoogleToken, Transporter, TokenOptions};
