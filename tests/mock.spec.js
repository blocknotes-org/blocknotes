const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test('has title', async ({ page }) => {
	await page.goto('/');

	// Expect a title "to contain" a substring.
	await expect(page).toHaveTitle(/Blocknotes/);
});

test('open file picker', async ({ page }) => {
	const fsaMockPath = path.resolve(
		'node_modules',
		'fsa-mock',
		'dist',
		'fsa-mock.umd.cjs'
	);
	const fsaMockScript = fs.readFileSync(fsaMockPath, 'utf8');

	await page.addInitScript(fsaMockScript);
	await page.addInitScript(() => {
		const { mock } = window.fsaMock;
		mock.install();
	});

	await page.goto('/');

	await page.getByRole('button', { name: 'Pick Folder' }).click();

	await expect(
		page
			.frameLocator('[name="editor-canvas"]')
			.getByRole('document', { name: 'Empty block' })
	).toBeFocused();
});
