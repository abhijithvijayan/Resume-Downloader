import {browser, Cookies} from 'webextension-polyfill-ts';

export function readAllCookies(
  options: {
    domain?: string;
    url?: string;
  } = {}
): Promise<Cookies.Cookie[]> {
  return browser.cookies.getAll(options);
}
