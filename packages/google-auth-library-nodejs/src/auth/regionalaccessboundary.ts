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

import {Gaxios, GaxiosOptions} from 'gaxios';
import {log as makeLog} from 'google-logging-utils';

const log = makeLog('auth');

// googleapis.com
export const SERVICE_ACCOUNT_LOOKUP_ENDPOINT =
  'https://iamcredentials.{universe_domain}/v1/projects/-/serviceAccounts/{service_account_email}/allowedLocations';

export const WORKLOAD_LOOKUP_ENDPOINT =
  'https://iamcredentials.{universe_domain}/v1/projects/{project_id}/locations/global/workloadIdentityPools/{pool_id}/allowedLocations';

export const WORKFORCE_LOOKUP_ENDPOINT =
  'https://iamcredentials.{universe_domain}/v1/locations/global/workforcePools/{pool_id}/allowedLocations';

/**
 * RAB is considered valid for 6 hours.
 */
const RAB_TTL_MILLIS = 6 * 60 * 60 * 1000;

/**
 * Initial cooldown period for RAB lookup failures (15 minutes).
 */
const RAB_INITIAL_COOLDOWN_MILLIS = 15 * 60 * 1000;

/**
 * Maximum cooldown period for RAB lookup failures.
 */
const RAB_MAX_COOLDOWN_MILLIS = 24 * 60 * 60 * 1000;

/**
 * Holds regional access boundary related information like locations
 * where the credentials can be used.
 */
export interface RegionalAccessBoundaryData {
  /**
   * The readable text format of the allowed regional access boundary locations.
   * This is optional, as it might not be present if no regional access boundary is enforced.
   */
  locations?: string[];

  /**
   * The encoded text format of allowed regional access boundary locations.
   * Expected to always be present in valid responses.
   */
  encodedLocations: string;
}

export function isRegionalAccessBoundaryEnabled() {
  const rabEnabled =
    process.env['GOOGLE_AUTH_TRUST_BOUNDARY_ENABLE_EXPERIMENT'];
  if (rabEnabled === undefined || rabEnabled === null) {
    return false;
  }
  const lowercasedRabEnabled = rabEnabled.toLowerCase();
  if (lowercasedRabEnabled === 'true' || rabEnabled === '1') {
    return true;
  }
  return false;
}

export interface RegionalAccessBoundaryManagerOptions {
  transporter: Gaxios;
  getLookupUrl: () => Promise<string | null>;
  isUniverseDomainDefault: () => boolean;
}

export class RegionalAccessBoundaryManager {
  private regionalAccessBoundary: RegionalAccessBoundaryData | null = null;
  private regionalAccessBoundaryExpiry = 0;
  private regionalAccessBoundaryRefreshPromise: Promise<void> | null = null;
  private regionalAccessBoundaryCooldownTime = 0;
  private regionalAccessBoundaryCooldownBackoff = RAB_INITIAL_COOLDOWN_MILLIS;
  private options: RegionalAccessBoundaryManagerOptions;

  constructor(options: RegionalAccessBoundaryManagerOptions) {
    this.options = options;
  }

  get enabled(): boolean {
    return isRegionalAccessBoundaryEnabled();
  }

  /**
   * @internal
   */
  get data(): RegionalAccessBoundaryData | null {
    return this.regionalAccessBoundary;
  }

  /**
   * @internal
   */
  get cooldownTime(): number {
    return this.regionalAccessBoundaryCooldownTime;
  }

  /**
   * Manually sets the regional access boundary data.
   * Treating this as a standard cache entry with a 6-hour TTL.
   * @param data The regional access boundary data to set.
   */
  setRegionalAccessBoundary(data: RegionalAccessBoundaryData) {
    this.regionalAccessBoundary = data;
    this.regionalAccessBoundaryExpiry = Date.now() + RAB_TTL_MILLIS;
  }

  /**
   * Clears the regional access boundary cache.
   */
  clearRegionalAccessBoundaryCache() {
    this.regionalAccessBoundary = null;
    this.regionalAccessBoundaryExpiry = 0;
  }

  /**
   * Returns the encoded locations string if the RAB is active and valid.
   */
  getRegionalAccessBoundaryHeader(): string | null {
    if (
      this.enabled &&
      this.regionalAccessBoundary &&
      this.regionalAccessBoundary.encodedLocations
    ) {
      return this.regionalAccessBoundary.encodedLocations;
    }
    return null;
  }

  /**
   * Checks if the given URL is a global endpoint (not regional).
   * @param url The URL to check.
   */
  private isGlobalEndpoint(url?: string | URL): boolean {
    if (!url) {
      return true;
    }
    const hostname = url instanceof URL ? url.hostname : new URL(url).hostname;
    return (
      !hostname.endsWith('.rep.googleapis.com') &&
      !hostname.endsWith('.rep.sandbox.googleapis.com')
    );
  }

  /**
   * Triggers an asynchronous regional access boundary refresh if needed.
   * @param url The endpoint URL being accessed.
   * @param accessToken The access token to use for the lookup.
   */
  maybeTriggerRegionalAccessBoundaryRefresh(
    url: string | URL | undefined,
    accessToken: string,
  ) {
    if (
      !this.enabled ||
      !this.options.isUniverseDomainDefault() ||
      !this.isGlobalEndpoint(url) ||
      this.regionalAccessBoundaryRefreshPromise
    ) {
      return;
    }

    const now = Date.now();

    // Check if in cooldown
    if (now < this.regionalAccessBoundaryCooldownTime) {
      return;
    }

    // Check if expired or never fetched
    if (
      !this.regionalAccessBoundary ||
      now >= this.regionalAccessBoundaryExpiry
    ) {
      this.regionalAccessBoundaryRefreshPromise =
        this.backgroundRefreshRegionalAccessBoundary(accessToken);
    }
  }

  /**
   * Performs the background refresh of the regional access boundary.
   * @param accessToken The access token to use for the lookup.
   */
  private async backgroundRefreshRegionalAccessBoundary(
    accessToken: string,
  ): Promise<void> {
    try {
      // Implement retry with exponential backoff for up to 1 minute.
      let attempt = 0;
      const startTime = Date.now();
      const maxRetryTime = 60 * 1000;
      let shouldContinue = true;

      while (shouldContinue) {
        try {
          const data = await this.fetchRegionalAccessBoundary(accessToken);
          if (data) {
            this.regionalAccessBoundary = data;
            this.regionalAccessBoundaryExpiry = Date.now() + RAB_TTL_MILLIS;
            // Reset cooldown on success
            this.regionalAccessBoundaryCooldownTime = 0;
            this.regionalAccessBoundaryCooldownBackoff =
              RAB_INITIAL_COOLDOWN_MILLIS;
          }
          shouldContinue = false;
        } catch (error) {
          const gaxiosError = error as {
            status?: number;
            response?: {status?: number};
          };
          const status = gaxiosError.status || gaxiosError.response?.status;
          const isRetryable =
            status !== undefined &&
            (status >= 500 || status === 403 || status === 404);

          if (isRetryable && Date.now() - startTime < maxRetryTime) {
            attempt++;
            const delay = Math.min(Math.pow(2, attempt) * 100, 10000);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }

          // Non-retryable or timeout: enter cooldown
          this.regionalAccessBoundaryCooldownTime =
            Date.now() + this.regionalAccessBoundaryCooldownBackoff;
          this.regionalAccessBoundaryCooldownBackoff = Math.min(
            this.regionalAccessBoundaryCooldownBackoff * 2,
            RAB_MAX_COOLDOWN_MILLIS,
          );
          log.error(
            'RegionalAccessBoundary: Lookup failed. Entering cooldown.',
            error,
          );
          shouldContinue = false;
        }
      }
    } catch (error) {
      log.error('RegionalAccessBoundary: Background refresh failed:', error);
    } finally {
      this.regionalAccessBoundaryRefreshPromise = null;
    }
  }

  /**
   * Internal method to fetch RAB data.
   */
  private async fetchRegionalAccessBoundary(
    accessToken?: string,
  ): Promise<RegionalAccessBoundaryData | null> {
    const regionalAccessBoundaryUrl = await this.options.getLookupUrl();
    if (!regionalAccessBoundaryUrl) {
      return null;
    }

    if (!accessToken) {
      throw new Error(
        'RegionalAccessBoundary: Error calling lookup endpoint without valid access token',
      );
    }

    const headers = new Headers({
      authorization: 'Bearer ' + accessToken,
    });

    const opts: GaxiosOptions = {
      ...{
        retry: true,
        retryConfig: {
          httpMethodsToRetry: ['GET'],
        },
      },
      headers,
      url: regionalAccessBoundaryUrl,
    };

    const {data: regionalAccessBoundaryData} =
      await this.options.transporter.request<RegionalAccessBoundaryData>(opts);

    if (!regionalAccessBoundaryData.encodedLocations) {
      throw new Error(
        'RegionalAccessBoundary: Malformed response from lookup endpoint.',
      );
    }

    return regionalAccessBoundaryData;
  }
}
