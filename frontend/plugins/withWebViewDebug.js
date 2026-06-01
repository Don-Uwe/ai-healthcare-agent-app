const { withMainApplication } = require('@expo/config-plugins');

const withWebViewDebug = (config) => {
  return withMainApplication(config, (config) => {
    let mainApplication = config.modResults.contents;

    // Add the import if it's not there
    if (!mainApplication.includes('import android.webkit.WebView')) {
      mainApplication = mainApplication.replace(
        'import android.app.Application',
        'import android.app.Application\nimport android.webkit.WebView'
      );
    }

    // Add the WebView debug configuration before DefaultNewArchitectureEntryPoint
    const debugStatement = `
    // Security: Only enable WebView remote debugging in debug builds.
    // In production, this prevents Chrome DevTools from inspecting WebView
    // content, extracting session cookies, or reading localStorage.
    WebView.setWebContentsDebuggingEnabled(BuildConfig.DEBUG)
    `;

    if (!mainApplication.includes('WebView.setWebContentsDebuggingEnabled')) {
      mainApplication = mainApplication.replace(
        'DefaultNewArchitectureEntryPoint.releaseLevel',
        `${debugStatement}\n    DefaultNewArchitectureEntryPoint.releaseLevel`
      );
    }

    config.modResults.contents = mainApplication;
    return config;
  });
};

module.exports = withWebViewDebug;
