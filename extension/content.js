document.addEventListener('DOMContentLoaded', () => {
    const htmlContent = document.documentElement.outerHTML;
    browser.runtime.sendMessage({ html: htmlContent, url: document.location.href });
});
