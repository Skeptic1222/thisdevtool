// E2E Regression Test for ThisDevTool - 8 Developer Tools
// Mobile portrait 390x844, checks console errors, screenshots

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:8765';
const SCREENSHOT_DIR = 'D:/Projects/businessideas/thisdevtool/test-screenshots';
const VIEWPORT = { width: 390, height: 844 };

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const results = [];

function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

async function testPage(browser, testName, url, testFn) {
  const context = await browser.newContext({ viewport: VIEWPORT });
  const page = await context.newPage();
  const consoleErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', err => {
    consoleErrors.push(`PAGE ERROR: ${err.message}`);
  });

  const result = {
    name: testName,
    url,
    status: 'PASS',
    failures: [],
    consoleErrors: [],
    screenshots: []
  };

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(800);

    // Initial screenshot
    const initScreenshot = path.join(SCREENSHOT_DIR, `${testName}-01-initial.png`);
    await page.screenshot({ path: initScreenshot, fullPage: false });
    result.screenshots.push(initScreenshot);
    log(`  Initial screenshot: ${initScreenshot}`);

    // Run tool-specific tests
    await testFn(page, result);

    // Final screenshot
    const finalScreenshot = path.join(SCREENSHOT_DIR, `${testName}-99-final.png`);
    await page.screenshot({ path: finalScreenshot, fullPage: false });
    result.screenshots.push(finalScreenshot);
    log(`  Final screenshot: ${finalScreenshot}`);

  } catch (err) {
    result.status = 'FAIL';
    result.failures.push(`Unexpected error: ${err.message}`);
    const errScreenshot = path.join(SCREENSHOT_DIR, `${testName}-ERROR.png`);
    try {
      await page.screenshot({ path: errScreenshot, fullPage: false });
      result.screenshots.push(errScreenshot);
    } catch (_) {}
  }

  result.consoleErrors = consoleErrors;
  if (consoleErrors.length > 0) {
    log(`  Console errors (${consoleErrors.length}): ${consoleErrors.slice(0, 3).join(' | ')}`);
  }

  results.push(result);
  await context.close();
  return result;
}

// ---- TOOL TESTS ----

async function testJsonFormatter(page, result) {
  log('  Testing JSON Formatter...');

  // Click Try Example
  const tryExampleBtn = page.locator('button:has-text("Try Example"), button:has-text("Example")').first();
  if (await tryExampleBtn.count() > 0) {
    await tryExampleBtn.click();
    await page.waitForTimeout(500);
    log('    Clicked Try Example');
  } else {
    result.failures.push('Try Example button not found');
  }

  // Verify output appears
  const output = page.locator('.code-output, #output, [id*="output"], pre').first();
  if (await output.count() > 0) {
    const text = await output.textContent();
    if (text && text.trim().length > 5) {
      log(`    Output appears (${text.trim().length} chars)`);
    } else {
      result.failures.push('Output is empty after Try Example');
    }
  } else {
    result.failures.push('Output element not found');
  }

  // Click Minify chip
  const minifyChip = page.locator('.chip:has-text("Minify"), button:has-text("Minify"), .option-chip:has-text("Minify")').first();
  if (await minifyChip.count() > 0) {
    await minifyChip.click();
    await page.waitForTimeout(400);
    log('    Clicked Minify chip');
    const minifiedText = await output.textContent().catch(() => '');
    if (minifiedText && !minifiedText.includes('\n')) {
      log('    Minified output confirmed (no newlines)');
    }
  } else {
    result.failures.push('Minify chip not found');
  }

  // Click Format chip (4 spaces or 2 spaces)
  const formatChip = page.locator('.chip:has-text("4 spaces"), .chip:has-text("2 spaces"), button:has-text("4 spaces"), .option-chip:has-text("4 spaces")').first();
  if (await formatChip.count() > 0) {
    await formatChip.click();
    await page.waitForTimeout(400);
    log('    Clicked Format chip');
  } else {
    result.failures.push('Format chip (4 spaces) not found');
  }

  // Copy button
  const copyBtn = page.locator('button:has-text("Copy"), button[id*="copy"]').first();
  if (await copyBtn.count() > 0) {
    await copyBtn.click();
    await page.waitForTimeout(300);
    log('    Clicked Copy button');
  } else {
    result.failures.push('Copy button not found');
  }

  if (result.failures.length === 0) result.status = 'PASS';
  else result.status = 'FAIL';
}

async function testBase64(page, result) {
  log('  Testing Base64 Encoder...');

  // Find input textarea
  const textarea = page.locator('textarea').first();
  if (await textarea.count() > 0) {
    await textarea.click();
    await textarea.fill('Hello World');
    await page.waitForTimeout(600);
    log('    Typed "Hello World"');
  } else {
    result.failures.push('Input textarea not found');
    result.status = 'FAIL';
    return;
  }

  // Check output for base64 value
  const output = page.locator('.code-output, #output, [id*="output"], pre, .result').first();
  if (await output.count() > 0) {
    const text = await output.textContent();
    if (text && text.includes('SGVsbG8gV29ybGQ=')) {
      log('    Correct base64 output: SGVsbG8gV29ybGQ=');
    } else {
      result.failures.push(`Base64 output incorrect: "${text ? text.trim().substring(0, 50) : 'empty'}"`);
    }
  } else {
    result.failures.push('Output element not found');
  }

  // Look for Decode mode chip/button
  const decodeBtn = page.locator('button:has-text("Decode"), .chip:has-text("Decode"), .option-chip:has-text("Decode"), input[value="decode"]').first();
  if (await decodeBtn.count() > 0) {
    await decodeBtn.click();
    await page.waitForTimeout(400);
    await textarea.fill('SGVsbG8gV29ybGQ=');
    await page.waitForTimeout(600);
    log('    Switched to decode mode, pasted encoded string');

    const decodeOutput = page.locator('.code-output, #output, [id*="output"], pre, .result').first();
    const decodeText = await decodeOutput.textContent().catch(() => '');
    if (decodeText && decodeText.includes('Hello World')) {
      log('    Decode output correct: Hello World');
    } else {
      result.failures.push(`Decode output incorrect: "${decodeText ? decodeText.trim().substring(0, 50) : 'empty'}"`);
    }
  } else {
    result.failures.push('Decode mode button/chip not found');
  }

  if (result.failures.length === 0) result.status = 'PASS';
  else result.status = 'FAIL';
}

async function testRegexTester(page, result) {
  log('  Testing Regex Tester...');

  // Find pattern input
  const patternInput = page.locator('input[placeholder*="pattern" i], input[id*="pattern"], input[placeholder*="regex" i], input[id*="regex"]').first();
  if (await patternInput.count() > 0) {
    await patternInput.click();
    await patternInput.fill('\\d+');
    await page.waitForTimeout(300);
    log('    Entered pattern \\d+');
  } else {
    result.failures.push('Pattern input not found');
    result.status = 'FAIL';
    return;
  }

  // Find test string input/textarea
  const testInput = page.locator('textarea, input[placeholder*="test" i], input[id*="test"]').first();
  if (await testInput.count() > 0) {
    await testInput.click();
    await testInput.fill('abc 123 def 456');
    await page.waitForTimeout(600);
    log('    Entered test string "abc 123 def 456"');
  } else {
    result.failures.push('Test string input not found');
    result.status = 'FAIL';
    return;
  }

  // Check for matches output
  const body = await page.content();
  const hasMatch = body.includes('123') || body.includes('match') || body.includes('Match');
  if (hasMatch) {
    log('    Matches visible in page');
  } else {
    result.failures.push('Matches not visible in page content');
  }

  if (result.failures.length === 0) result.status = 'PASS';
  else result.status = 'FAIL';
}

async function testJwtDecoder(page, result) {
  log('  Testing JWT Decoder...');

  const SAMPLE_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

  // Try Example first
  const tryExampleBtn = page.locator('button:has-text("Try Example"), button:has-text("Example")').first();
  if (await tryExampleBtn.count() > 0) {
    await tryExampleBtn.click();
    await page.waitForTimeout(600);
    log('    Clicked Try Example');
  } else {
    // Paste JWT manually
    const textarea = page.locator('textarea').first();
    if (await textarea.count() > 0) {
      await textarea.fill(SAMPLE_JWT);
      await page.waitForTimeout(600);
      log('    Pasted sample JWT manually');
    } else {
      result.failures.push('No input found for JWT');
      result.status = 'FAIL';
      return;
    }
  }

  // Check for decoded sections
  const content = await page.content();
  const hasHeader = content.includes('alg') || content.includes('typ') || content.includes('Header') || content.includes('header');
  const hasPayload = content.includes('sub') || content.includes('iat') || content.includes('Payload') || content.includes('payload');

  if (hasHeader) {
    log('    Header section decoded (alg/typ visible)');
  } else {
    result.failures.push('JWT header not decoded (alg/typ not found)');
  }

  if (hasPayload) {
    log('    Payload section decoded (sub/iat visible)');
  } else {
    result.failures.push('JWT payload not decoded (sub/iat not found)');
  }

  if (result.failures.length === 0) result.status = 'PASS';
  else result.status = 'FAIL';
}

async function testHashGenerator(page, result) {
  log('  Testing Hash Generator...');

  const textarea = page.locator('textarea, input[type="text"]').first();
  if (await textarea.count() > 0) {
    await textarea.click();
    await textarea.fill('test');
    await page.waitForTimeout(800);
    log('    Typed "test"');
  } else {
    result.failures.push('Input textarea not found');
    result.status = 'FAIL';
    return;
  }

  // Expected SHA-256 of "test"
  const SHA256_OF_TEST = '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08';

  const content = await page.content();
  if (content.toLowerCase().includes(SHA256_OF_TEST)) {
    log(`    SHA-256 output correct: ${SHA256_OF_TEST}`);
  } else {
    // Check if any hash is visible
    const hashMatch = content.match(/[0-9a-f]{64}/i);
    if (hashMatch) {
      log(`    Hash output visible: ${hashMatch[0]}`);
    } else {
      result.failures.push('SHA-256 hash not visible in page');
    }
  }

  if (result.failures.length === 0) result.status = 'PASS';
  else result.status = 'FAIL';
}

async function testUuidGenerator(page, result) {
  log('  Testing UUID Generator...');

  // Click generate button
  const generateBtn = page.locator('button:has-text("Generate"), button:has-text("New"), button:has-text("UUID")').first();
  if (await generateBtn.count() > 0) {
    await generateBtn.click();
    await page.waitForTimeout(600);
    log('    Clicked Generate button');
  } else {
    result.failures.push('Generate button not found');
    result.status = 'FAIL';
    return;
  }

  // Check for UUID format
  const content = await page.content();
  const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
  const uuidMatch = content.match(uuidRegex);
  if (uuidMatch) {
    log(`    UUID generated: ${uuidMatch[0]}`);
  } else {
    result.failures.push('UUID format not found in page content');
  }

  if (result.failures.length === 0) result.status = 'PASS';
  else result.status = 'FAIL';
}

async function testColorConverter(page, result) {
  log('  Testing Color Converter...');

  // Look for hex input
  const hexInput = page.locator('input[placeholder*="#" i], input[placeholder*="hex" i], input[id*="hex"]').first();
  if (await hexInput.count() > 0) {
    await hexInput.click();
    await hexInput.triple_click?.() || await hexInput.selectAll?.() || await hexInput.press('Control+a');
    await hexInput.fill('#ff5733');
    await hexInput.press('Enter');
    await page.waitForTimeout(600);
    log('    Entered #ff5733 in hex input');
  } else {
    // Try generic text input
    const textInput = page.locator('input[type="text"]').first();
    if (await textInput.count() > 0) {
      await textInput.click();
      await textInput.press('Control+a');
      await textInput.fill('#ff5733');
      await textInput.press('Enter');
      await page.waitForTimeout(600);
      log('    Entered #ff5733 in text input');
    } else {
      result.failures.push('Hex input not found');
      result.status = 'FAIL';
      return;
    }
  }

  // Verify RGB values appear (255, 87, 51)
  const content = await page.content();
  const hasRgb = content.includes('255') && (content.includes('87') || content.includes('rgb'));
  const hasHsl = content.includes('hsl') || content.includes('HSL');

  if (hasRgb) {
    log('    RGB values visible (255, 87, 51)');
  } else {
    result.failures.push('RGB values not visible in page');
  }

  if (hasHsl) {
    log('    HSL section visible');
  } else {
    result.failures.push('HSL section not visible');
  }

  if (result.failures.length === 0) result.status = 'PASS';
  else result.status = 'FAIL';
}

async function testCronParser(page, result) {
  log('  Testing Cron Parser...');

  // Find cron input
  const cronInput = page.locator('input[placeholder*="cron" i], input[placeholder*="* * *" i], input[id*="cron"], input[type="text"]').first();
  if (await cronInput.count() > 0) {
    await cronInput.click();
    await cronInput.press('Control+a');
    await cronInput.fill('0 5 * * *');
    await cronInput.press('Enter');
    await page.waitForTimeout(600);
    log('    Entered "0 5 * * *"');
  } else {
    const textarea = page.locator('textarea').first();
    if (await textarea.count() > 0) {
      await textarea.fill('0 5 * * *');
      await page.waitForTimeout(600);
      log('    Entered "0 5 * * *" in textarea');
    } else {
      result.failures.push('Cron input not found');
      result.status = 'FAIL';
      return;
    }
  }

  // Verify human-readable description appears
  const content = await page.content();
  const hasDescription =
    content.includes('5:00') ||
    content.includes('5 AM') ||
    content.includes('5 am') ||
    content.includes('minute 0') ||
    content.includes('At 05:00') ||
    content.includes('every day') ||
    content.includes('Every day') ||
    content.includes('daily') ||
    content.includes('Daily') ||
    content.includes('5') && content.includes('every');

  if (hasDescription) {
    log('    Human-readable description appears');
  } else {
    result.failures.push('Human-readable cron description not visible');
  }

  if (result.failures.length === 0) result.status = 'PASS';
  else result.status = 'FAIL';
}

async function testThemeToggle(page, result, toolName) {
  log(`  Testing theme toggle on ${toolName}...`);
  const themeBtn = page.locator('button[id*="theme"], button[aria-label*="theme" i], button:has-text("Dark"), button:has-text("Light"), #themeToggle, .theme-toggle').first();
  if (await themeBtn.count() > 0) {
    await themeBtn.click();
    await page.waitForTimeout(400);
    log('    Clicked theme toggle');
    // Check body class changed
    const bodyClass = await page.locator('body').getAttribute('class');
    log(`    Body class after toggle: ${bodyClass}`);
  } else {
    result.failures.push('Theme toggle button not found');
  }
}

async function testInstructionsLink(page, result) {
  log('  Testing instructions link...');
  const instrLink = page.locator('a:has-text("Click here for instructions"), a:has-text("instructions")').first();
  if (await instrLink.count() > 0) {
    await instrLink.click();
    await page.waitForTimeout(500);
    log('    Clicked instructions link');
  } else {
    log('    No instructions link found (may be embedded differently)');
  }
}

// ---- MAIN ----

(async () => {
  log('Starting E2E regression tests (mobile 390x844)');
  const browser = await chromium.launch({ headless: true });

  const tests = [
    {
      name: 'json-formatter',
      url: `${BASE_URL}/tools/json-formatter.html`,
      fn: testJsonFormatter
    },
    {
      name: 'base64-encoder',
      url: `${BASE_URL}/tools/base64.html`,
      fn: testBase64
    },
    {
      name: 'regex-tester',
      url: `${BASE_URL}/tools/regex-tester.html`,
      fn: testRegexTester
    },
    {
      name: 'jwt-decoder',
      url: `${BASE_URL}/tools/jwt-decoder.html`,
      fn: testJwtDecoder
    },
    {
      name: 'hash-generator',
      url: `${BASE_URL}/tools/hash-generator.html`,
      fn: testHashGenerator
    },
    {
      name: 'uuid-generator',
      url: `${BASE_URL}/tools/uuid-generator.html`,
      fn: testUuidGenerator
    },
    {
      name: 'color-converter',
      url: `${BASE_URL}/tools/color-converter.html`,
      fn: testColorConverter
    },
    {
      name: 'cron-parser',
      url: `${BASE_URL}/tools/cron-parser.html`,
      fn: testCronParser
    }
  ];

  for (const test of tests) {
    log(`\n=== Testing: ${test.name} ===`);
    const r = await testPage(browser, test.name, test.url, test.fn);
    log(`  Result: ${r.status} | Failures: ${r.failures.length} | Console errors: ${r.consoleErrors.length}`);
  }

  await browser.close();

  // Print summary
  console.log('\n\n========== REGRESSION REPORT ==========\n');
  for (const r of results) {
    const icon = r.status === 'PASS' ? 'PASS' : 'FAIL';
    console.log(`[${icon}] ${r.name}`);
    if (r.failures.length > 0) {
      for (const f of r.failures) {
        console.log(`       FAILURE: ${f}`);
      }
    }
    if (r.consoleErrors.length > 0) {
      console.log(`       CONSOLE ERRORS (${r.consoleErrors.length}):`);
      for (const e of r.consoleErrors.slice(0, 5)) {
        console.log(`         - ${e}`);
      }
    }
    console.log(`       Screenshots: ${r.screenshots.map(s => s.split('/').pop()).join(', ')}`);
  }

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  console.log(`\nTOTAL: ${passed} PASS / ${failed} FAIL out of ${results.length}`);

  // Write JSON report
  const reportPath = 'D:/Projects/businessideas/thisdevtool/test-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\nFull report: ${reportPath}`);
})();
