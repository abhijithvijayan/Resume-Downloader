import {browser, Tabs} from 'webextension-polyfill-ts';

// opens a URL in a new tab
export function createTab(url: string): Promise<Tabs.Tab> {
  return browser.tabs.create({url});
}

// opens extension's opens page
export function openExtOptionsPage(): Promise<void> {
  return browser.runtime.openOptionsPage();
}

export function getActiveTab(): Promise<Tabs.Tab[]> {
  return browser.tabs.query({
    active: true,
  });
}
