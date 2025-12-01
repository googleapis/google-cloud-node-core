// Copyright 2025 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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
