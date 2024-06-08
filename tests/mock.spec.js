const {
	describe,
	beforeEach,
	afterEach,
	test,
	expect,
} = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const fsaMockPath = path.resolve(
	'node_modules',
	'fsa-mock',
	'dist',
	'fsa-mock.umd.cjs'
);
const fsaMockScript = fs.readFileSync(fsaMockPath, 'utf8');

describe('Blocknotes', () => {
	beforeEach(async ({ page }) => {
		await page.addInitScript(fsaMockScript);
		await page.addInitScript(() => {
			const { mock } = window.fsaMock;
			mock.install();
			mock.onDirectoryPicker(() => '');
		});

		await page.goto('/');
	});

	afterEach(async ({ page }) => {
		await page.evaluate(() => {
			const { mock } = window.fsaMock;
			mock.uninstall();
		});
	});

	test('open file picker', async ({ page }) => {
		await expect(page).toHaveTitle(/Blocknotes/);

		await page.getByRole('button', { name: 'Pick Folder' }).click();

		const emptyBlock = page
			.frameLocator('[name="editor-canvas"]')
			.getByRole('document', { name: 'Empty block' });

		await expect(emptyBlock).toBeFocused();

		const notesButton = page.getByRole('button', { name: 'Notes' });

		await notesButton.click();

		await expect(
			page.getByRole('menu', { name: 'Notes' }).getByRole('menuitem')
		).toHaveText(['New Note', 'Untitled', 'Pick Folder']);

		await emptyBlock.click();

		await page.keyboard.type('a');

		await expect(
			page
				.frameLocator('[name="editor-canvas"]')
				.getByRole('document', { name: 'Block: Paragraph' })
		).toBeFocused();

		await notesButton.click();

		await expect(
			page.getByRole('menu', { name: 'Notes' }).getByRole('menuitem')
		).toHaveText(['New Note', 'a', 'Pick Folder']);

		// wait 1s
		await page.waitForTimeout(1000);

		const exists = await page.evaluate(() => {
			return window.fsaMock.mock.exists('a.html');
		});

		expect(exists).toBe(true);

		// check directory for file.
		const isFile = await page.evaluate(() => {
			return window.fsaMock.mock.isFile('a.html');
		});

		expect(isFile).toBe(true);

		const contents = await page.evaluate(() => {
			return new TextDecoder('utf-8').decode(
				window.fsaMock.mock.contents('a.html')
			);
		});

		expect(contents).toBe(`<!-- wp:paragraph -->
<p>a</p>
<!-- /wp:paragraph -->`);

		const paths = await page.evaluate(() => {
			return window.fsaMock.mock.fs().getDescendantPaths('');
		});

		// Ensure the initial file is gone and renamed, expect no other files.
		expect(paths).toEqual(['a.html']);
	});
});
