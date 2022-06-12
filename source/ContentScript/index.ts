import {isNull} from '@abhijithvijayan/ts-utils';
import {NullOr} from '../types';

export function getIframeDocument(iframe: HTMLIFrameElement): Document {
  const iframeWin = iframe.contentWindow || iframe;
  let iframeDoc: Document = iframe.contentDocument as never;
  if (isNull(iframeDoc) && 'document' in iframeWin) {
    iframeDoc = iframeWin.document;
  }

  return iframeDoc;
}

function addCustomClasses(): void {
  const style = document.createElement('style');
  style.textContent = `
      .downloader__custom--my-4 {
        margin-top: 1.5rem !important;
        margin-bottom: 1.5rem !important;
      }
  `;
  document.head.append(style);
}

function getPreviewIframe(small = false): NullOr<HTMLIFrameElement> {
  if (small) {
    return document.getElementById(
      'resume-small-preview-iframe'
    ) as NullOr<HTMLIFrameElement>;
  }

  // get iframe element where preview is rendered
  return document.getElementById(
    'resume-preview-iframe'
  ) as NullOr<HTMLIFrameElement>;
}

function getPreviewTabParent(
  previewIframe: HTMLIFrameElement
): NullOr<HTMLDivElement> {
  // get the parent tab element which is being hidden
  return previewIframe?.closest('div.d-none') as NullOr<HTMLDivElement>;
}

function displayPreviewTab(previewTab: HTMLDivElement): void {
  // keep the tab hidden but should let it render
  previewTab.style.setProperty('visibility', 'hidden');
  // make the tab visible
  previewTab.style.setProperty('display', 'block', 'important');
}

function hidePreviewTab(previewTab: HTMLDivElement): void {
  // make the tab hidden again
  previewTab.style.removeProperty('display');
  previewTab.style.removeProperty('visibility');
}

function getDownloadBtn(parent: HTMLDivElement): NullOr<HTMLAnchorElement> {
  return (
    // when not signed in, the element itself acts like a sign in button
    (parent.querySelector('a[data-target="#sign-in-modal"]') ||
      // otherwise a button to open payment modal
      parent.querySelector(
        'a[data-target="#payment-modal"]'
      )) as NullOr<HTMLAnchorElement>
  );
}

function getPageHTML(url: string, cb: (http: XMLHttpRequest) => void): void {
  const http = new XMLHttpRequest();

  // If there is an element with data-app='mm' get all data attribute of that element and send it as params of the request
  // On response call onFeaturesLoaded
  http.addEventListener('load', cb.bind(null, http));
  http.open('GET', url, true);
  http.send();
}

function initDownload(): void {
  const previewIframe = getPreviewIframe();

  if (previewIframe) {
    // use the iframe source URL
    const previewURL = new URL(previewIframe.src);
    const searchParams = new URLSearchParams(previewURL.search);
    // set a new session id for reloading iframe
    searchParams.set('sid', new Date().getTime().toString());
    previewURL.search = `?${searchParams}`;

    // get plain html for the URL
    getPageHTML(previewURL.href, (req) => {
      // use srcdoc attribute to render the static version of content in the iframe
      previewIframe.srcdoc = req.responseText
        // prevent link corruption
        .replace("anchor.href = '#'", 'anchor.href = anchor.href')
        .replace(
          "anchor.title = 'Links are disabled in preview'",
          'anchor.title = anchor.title'
        );
    });
  }
}

function cloneDownloadBtn(btn: HTMLAnchorElement): HTMLAnchorElement {
  const clone = btn.cloneNode(true) as HTMLAnchorElement;
  // clear unwanted attributes
  clone.removeAttribute('data-toggle');
  clone.removeAttribute('data-target');

  // make the anchor a button
  clone.setAttribute('type', 'button');
  clone.setAttribute('href', '#');

  // attach some style classes
  clone.classList.add('downloader__custom--my-4');

  // attach a click event listener
  clone.addEventListener('click', (e) => {
    e.stopPropagation();
    initDownload();
  });

  return clone;
}

(function init(): void {
  window.onload = (): void => {
    const previewIframe = getPreviewIframe();

    if (previewIframe?.contentWindow) {
      // get the Design tab element
      const previewParent = getPreviewTabParent(previewIframe);
      if (previewParent instanceof HTMLDivElement) {
        // whenever iframe window is refreshed and loading is complete
        // this callback gets invoked
        previewIframe.addEventListener('load', (): void => {
          // on clicking download button, srcdoc attribute is set to the iframe
          // if that exist, trigger print window
          if (previewIframe.hasAttribute('srcdoc')) {
            // show the tab to render the iframe properly
            displayPreviewTab(previewParent);

            // after closing of print dialog, revert to the preview version iframe
            (previewIframe.contentWindow as Window).addEventListener(
              'afterprint',
              () => {
                // hide the Design tab
                hidePreviewTab(previewParent);

                // clear srcdoc attribute to revert iframe to src attribute
                previewIframe.removeAttribute('srcdoc');
              }
            );

            (previewIframe.contentWindow as Window).focus(); // focus on contentWindow is needed on some ie versions
            // open the print dialog
            setTimeout(() => {
              (previewIframe.contentWindow as Window).print();
            }, 200); // adding a timeout as rendering a large document can take a little time
          }
        });

        // append custom classes to page
        addCustomClasses();

        // get the dummy download button
        const dummyDownloadBtn = getDownloadBtn(previewParent);
        if (dummyDownloadBtn instanceof HTMLAnchorElement) {
          // get the small sized preview iframe
          const previewSmallIframe = getPreviewIframe(true);
          if (previewSmallIframe instanceof HTMLIFrameElement) {
            // clone a new download button with new actions
            const contentTabDownloadBtn = cloneDownloadBtn(dummyDownloadBtn);
            // in Content tab, inject btn below the small sized preview iframe
            previewSmallIframe.parentElement?.parentElement?.append(
              contentTabDownloadBtn
            );

            // replace btn in Design tab
            const designTabDownloadBtn = cloneDownloadBtn(dummyDownloadBtn);
            dummyDownloadBtn.parentElement?.append(designTabDownloadBtn);
            // remove the dummy button
            dummyDownloadBtn.remove();
          }
        }
      }
    }
  };
})();

export {};
