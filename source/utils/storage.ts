import {browser} from 'webextension-polyfill-ts';
import {isUndefined} from '@abhijithvijayan/ts-utils';

import {NullOr} from '../types';

export class Storage {
  private static instance: Storage | undefined;

  constructor() {
    if (Storage.instance instanceof Storage) {
      throw new Error(
        'The singleton class Storage cannot be initialized more than once'
      );
    }

    // Storing this instance in a static variable
    Storage.instance = this;
  }

  static getInstance(): Storage {
    if (isUndefined(Storage.instance)) {
      Storage.instance = new Storage();
    }

    return Storage.instance;
  }

  get<T = NullOr<string> | Array<string>, P = undefined>(
    key: T
  ): Promise<Record<string, P>> {
    return browser.storage.local.get(key);
  }

  // update extension settings in browser storage
  // Note: this wont be shared across browsers wherever user is logged in
  set<T = string>(key: T, value: never | unknown): Promise<void> {
    return browser.storage.local.set({[key as unknown as string]: value});
  }

  // clear all data from storage
  clear(): Promise<void> {
    return browser.storage.local.clear();
  }
}
