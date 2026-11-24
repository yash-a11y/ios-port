import fs from 'node:fs';
import path from 'node:path';

// iOS config. It runs on GitHub's cloud Mac, where the workflow has already started Appium.
// It does not touch your Android configs.

// The workflow sets ARTIFACT_DIR. Anything saved there is uploaded in the "ios-test-results" artifact.
const ART = process.env.ARTIFACT_DIR ?? './artifacts';

export const config: WebdriverIO.Config = {
  runner: 'local',
  hostname: process.env.APPIUM_HOST ?? '127.0.0.1',
  port: Number(process.env.APPIUM_PORT ?? 4723),
  path: '/',

  // Only the iOS tests. The Android specs use Android locators and would fail on iOS.
  specs: [path.resolve(process.cwd(), 'test/ios/specs/**/*.ts')],
  maxInstances: 1,

  capabilities: [
    {
      platformName: 'iOS',
      'appium:automationName': 'XCUITest',
      'appium:deviceName': process.env.DEVICE_NAME ?? 'iPhone 16',
      'appium:platformVersion': process.env.PLATFORM_VERSION ?? '26.0',
      'appium:udid': process.env.UDID,
      'appium:app': process.env.APP_PATH,
      'appium:bundleId': 'org.wikimedia.wikipedia',
      'appium:wdaLaunchTimeout': 240000,
      'appium:wdaConnectionTimeout': 240000,
      'appium:newCommandTimeout': 300,
      // Accepts iOS system pop-ups (for example notifications or location) automatically.
      'appium:autoAcceptAlerts': true,
      // The simulator is already running: use it instead of restarting it with a window.
      'appium:isHeadless': true,
      // Slow Intel Macs can need more than the default 2 minutes to start the simulator.
      'appium:simulatorStartupTimeout': 600000,
      ...(process.env.USE_PREBUILT_WDA
        ? { 'appium:usePrebuiltWDA': true, 'appium:derivedDataPath': process.env.WDA_DERIVED_DATA }
        : {}),
    },
  ],

  framework: 'mocha',
  mochaOpts: { ui: 'bdd', timeout: 180000 },
  reporters: ['spec'],
  logLevel: 'info',
  waitforTimeout: 20000,
  connectionRetryTimeout: 240000,
  connectionRetryCount: 1,

  // When a test fails, save a screenshot and the screen's element list (page source), named after the test.
  afterTest: async function (test, _context, { passed }) {
    if (passed) return;
    const name = 'ios_' + test.title.replace(/[^a-z0-9]+/gi, '_').toLowerCase();
    fs.mkdirSync(path.join(ART, 'screenshots'), { recursive: true });
    await browser.saveScreenshot(path.join(ART, 'screenshots', `${name}.png`));
    fs.writeFileSync(path.join(ART, `page_source_${name}.xml`), await browser.getPageSource());
  },
};
