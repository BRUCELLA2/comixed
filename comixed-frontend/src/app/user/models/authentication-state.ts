/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

import { User } from './user';

export declare interface AuthenticationState {
  initialized: boolean;
  authenticating: boolean;
  authenticated: boolean;
  setting_preference: boolean;
  user: User;
  auth_token: string;
  show_login: boolean;
}

export const initial_state: AuthenticationState = {
  initialized: false,
  authenticating: false,
  authenticated: false,
  setting_preference: false,
  user: null,
  auth_token: null,
  show_login: false
};
