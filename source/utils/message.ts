import {browser} from 'webextension-polyfill-ts';

export function sendMessage<T = never>(
  action: string,
  params?: unknown
): Promise<T> {
  return browser.runtime.sendMessage({
    action,
    params,
  });
}
