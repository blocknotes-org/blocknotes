import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const fsaMockPath = path.resolve(
	'node_modules',
	'fsa-mock',
	'dist',
	'fsa-mock.umd.cjs'
);
const fsaMockScript = fs.readFileSync(fsaMockPath, 'utf8');

function canvas(page) {
	return page.frameLocator('[name="editor-canvas"]');
}

async function getPaths(page) {
	return await page.evaluate(() => {
		return window.fsaMock.mock.fs().getDescendantPaths('');
	});
}

async function getContents(page, _path) {
	return await page.evaluate((__path) => {
		return new TextDecoder('utf-8').decode(
			window.fsaMock.mock.contents(__path)
		);
	}, _path);
}

async function isFile(page, _path) {
	return await page.evaluate((__path) => {
		return window.fsaMock.mock.isFile(__path);
	}, _path);
}

test.describe('Blocknotes', () => {
	test.beforeEach(async ({ page }) => {
		await page.addInitScript(fsaMockScript);
		await page.addInitScript(() => {
			const { mock } = window.fsaMock;
			mock.install();
			mock.onDirectoryPicker(() => '');
		});

		await page.goto('/');

		page.on('pageerror', (error) => {
			throw error;
		});
	});

	test.afterEach(async ({ page }) => {
		await page.evaluate(() => {
			const { mock } = window.fsaMock;
			mock.uninstall();
		});
	});

	test('open file picker', async ({ page }) => {
		await expect(page).toHaveTitle(/Blocknotes/);

		await page.getByRole('button', { name: 'Pick Folder' }).click();

		const emptyBlock = canvas(page).getByRole('document', {
			name: 'Empty block',
		});

		await expect(emptyBlock).toBeFocused();

		await page.getByRole('button', { name: 'Notes' }).click();

		await expect(page.getByRole('row').locator('.note-title')).toHaveText([
			'Untitled',
		]);

		await emptyBlock.click();

		await page.keyboard.type('aa');

		await expect(
			canvas(page).getByRole('document', { name: 'Block: Paragraph' })
		).toBeFocused();

		await expect(page.getByRole('row').locator('.note-title')).toHaveText([
			'aa',
		]);

		// Nothing should have been saved yet because saving is debounced.
		expect(await getPaths(page)).toEqual([]);

		const block = canvas(page).getByRole('document', {
			name: 'Block: Paragraph',
		});

		await block.click();
		await expect(block).toBeFocused();

		// wait 1s
		await page.waitForTimeout(1000);

		// Make sure saving doesn't remove focus.
		await expect(block).toBeFocused();

		// Ensure the initial file is gone and renamed, expect no other files.
		expect(await getPaths(page)).toEqual(['aa.html']);
		expect(await isFile(page, 'aa.html')).toBe(true);
		expect(await getContents(page, 'aa.html')).toBe(`<!-- wp:paragraph -->
<p>aa</p>
<!-- /wp:paragraph -->`);

		// Focus should be kept during subsequent saves.
		await page.keyboard.type('a');
		await page.waitForTimeout(1000);
		await page.keyboard.type('a');
		await page.waitForTimeout(1000);

		expect(await getPaths(page)).toEqual(['aaaa.html']);
		expect(await getContents(page, 'aaaa.html')).toBe(`<!-- wp:paragraph -->
<p>aaaa</p>
<!-- /wp:paragraph -->`);

		// Create a second note.
		await page.getByRole('button', { name: 'New Note' }).click();

		await page.keyboard.type('b');

		await expect(page.getByRole('row').locator('.note-title')).toHaveText([
			'b',
			'aaaa',
		]);

		// Immediately switch back to note A.
		await page.getByRole('button', { name: 'aaaa' }).click();

		await expect(
			canvas(page).getByRole('document', { name: 'Block: Paragraph' })
		).toHaveText('aaaa');

		// Check if note B is saved.
		expect(await getPaths(page)).toEqual(['aaaa.html', 'b.html']);
		expect(await getContents(page, 'b.html')).toBe(`<!-- wp:paragraph -->
<p>b</p>
<!-- /wp:paragraph -->`);
	});

	test('undo/redo', async ({ page }) => {
		await page.getByRole('button', { name: 'Pick Folder' }).click();

		const undo = page.getByRole('button', { name: 'Undo' });
		const redo = page.getByRole('button', { name: 'Redo' });

		await expect(undo).toBeDisabled();
		await expect(redo).toBeDisabled();

		await page.keyboard.type('a');

		await expect(undo).toBeEnabled();
		await expect(redo).toBeDisabled();

		// Typing a second character within 1s should be within the same undo
		// step.
		await page.waitForTimeout(500);
		await page.keyboard.type('b');

		await page.waitForTimeout(1000);
		await page.keyboard.type('c');

		const paragraph = canvas(page).getByRole('document', {
			name: 'Block: Paragraph',
		});

		await expect(paragraph).toHaveText('abc');

		await page.keyboard.press('Meta+z');

		await expect(paragraph).toHaveText('ab');
		await expect(undo).toBeEnabled();
		await expect(redo).toBeEnabled();

		await undo.click();

		const emptyBlock = canvas(page).getByRole('document', {
			name: 'Empty block',
		});

		await expect(emptyBlock).toBeFocused();
		await expect(undo).toBeDisabled();

		await page.keyboard.press('Meta+Shift+z');

		await expect(paragraph).toHaveText('ab');
		await expect(undo).toBeEnabled();
		await expect(redo).toBeEnabled();

		await redo.click();

		await expect(paragraph).toHaveText('abc');
		await expect(undo).toBeEnabled();
		await expect(redo).toBeDisabled();

		await undo.click();
		await expect(redo).toBeEnabled();
		await page.keyboard.type('d');
		await expect(redo).toBeDisabled();
	});

	test('existing filename', async ({ page }) => {
		await page.getByRole('button', { name: 'Pick Folder' }).click();

		await page.keyboard.type('a');
		await page.keyboard.press('Enter');
		await page.keyboard.type('1');

		const notesButton = page.getByRole('button', { name: 'Notes' });

		await page.getByRole('button', { name: 'New Note' }).click();

		await page.keyboard.type('a');
		await page.keyboard.press('Enter');
		await page.keyboard.type('2');

		await notesButton.click();
		await page
			.getByRole('row')
			.locator('.note-title:text("a")')
			.nth(1)
			.click();

		await expect(
			canvas(page)
				.getByRole('document', { name: 'Block: Paragraph' })
				.nth(1)
		).toHaveText('1');

		// The original file should be intact.
		expect(await getPaths(page)).toEqual([
			'a.html',
			expect.stringMatching(/^a\.\d+\.html$/),
		]);
		expect(await getContents(page, 'a.html')).toBe(`<!-- wp:paragraph -->
<p>a</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>1</p>
<!-- /wp:paragraph -->`);
	});
});
