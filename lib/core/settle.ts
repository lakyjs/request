import type { OxiosResponse } from '@/types';
import type OxiosError from './OxiosError';

import { createError, ErrorCodes } from './OxiosError';

export default function settle(
  resolve: (value: OxiosResponse) => void,
  reject: (reason?: OxiosError) => void,
  response: OxiosResponse
) {
  const validateStatus = response.config.validateStatus;
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  }
  else {
    reject(
      createError(
        `Request failed with status code ${response.status}`,
        response.config,
        [ErrorCodes.ERR_BAD_REQUEST.value, ErrorCodes.ERR_BAD_RESPONSE.value][
          Math.floor(response.status / 100) - 4
        ],
        response.request,
        response
      )
    );
  }
}
