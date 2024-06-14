const htmlContent = document.documentElement.outerHTML;
chrome.runtime.sendMessage({ html: htmlContent, url: document.location.href });