/*
 * Copyright 2020 Ian Johnson
 *
 * This is free software, distributed under the MIT license.  A copy of the
 * license can be found in the LICENSE file in the project root, or at
 * https://opensource.org/licenses/MIT.
 */

/** A generic error used in the application to create an alert box. */
export default class AppError {
  constructor(message, details) {
    this.message = message;
    this.details = details;
  }
}
