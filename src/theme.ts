/*
 * Copyright 2020 Ian Johnson
 *
 * This is free software, distributed under the MIT license.  A copy of the
 * license can be found in the LICENSE file in the project root, or at
 * https://opensource.org/licenses/MIT.
 */
import { DefaultTheme } from 'styled-components';

export interface Theme {
  name: string;
  theme: DefaultTheme;
}

export const defaultTheme: Theme = {
  name: 'Light (default)',
  theme: {
    accentColor: '#1e9be9',
    backgroundColor: '#f0f0f0',
    borderColor: '#ccc',
    linkColor: '#00e',
    linkVisitedColor: '#551a8b',
    modalOverlayColor: 'rgba(0, 0, 0, 0.5)',
    mutedTextColor: '#666',
    panelBackgroundColor: '#e7e7e7',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    textColor: '#111',
    tuneBackgroundLuminosity: '80%',
  },
};

export const darkTheme: Theme = {
  name: 'Dark',
  theme: {
    accentColor: '#004f9d',
    backgroundColor: '#3f3f3f',
    borderColor: '#444',
    linkColor: '#77e',
    linkVisitedColor: '#a876d6',
    modalOverlayColor: 'rgba(0, 0, 0, 0.5)',
    mutedTextColor: '#888',
    panelBackgroundColor: '#272727',
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    textColor: '#aaa',
    tuneBackgroundLuminosity: '20%',
  },
};

export const themes = [defaultTheme, darkTheme];
