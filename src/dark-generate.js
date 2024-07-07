import fs from 'fs';
import tinycolor from 'tinycolor2';

const css = fs.readFileSync('./src/light.css', 'utf8');

function invertColor(color, amount = 0.9) {
	const rgb = tinycolor(color).toRgb();
	const invertedRgb = {
		r: Math.round((1 - amount) * rgb.r + amount * (255 - rgb.r)),
		g: Math.round((1 - amount) * rgb.g + amount * (255 - rgb.g)),
		b: Math.round((1 - amount) * rgb.b + amount * (255 - rgb.b)),
	};
	return tinycolor(invertedRgb);
}

function hueRotateColor(color, amount = 180) {
	const rgb = tinycolor(color).toRgb();
	const hueMatrix = calculateHueRotateMatrix(amount);
	const rotatedRgb = applyColorMatrix(rgb, hueMatrix);
	return tinycolor(rotatedRgb);
}

function calculateHueRotateMatrix(angle) {
	const a = (angle * Math.PI) / 180;
	const cos = Math.cos(a);
	const sin = Math.sin(a);

	const lumR = 0.213;
	const lumG = 0.715;
	const lumB = 0.072;

	const magenta = 0.143; // Previously unexplained
	const green = 0.14; // Previously unexplained
	const blue = 0.283; // Previously unexplained

	return [
		lumR + cos * (1 - lumR) + sin * -lumR,
		lumG + cos * -lumG + sin * -lumG,
		lumB + cos * -lumB + sin * (1 - lumB),

		lumR + cos * -lumR + sin * magenta,
		lumG + cos * (1 - lumG) + sin * green,
		lumB + cos * -lumB + sin * -blue,

		lumR + cos * -lumR + sin * -(1 - lumR),
		lumG + cos * -lumG + sin * lumG,
		lumB + cos * (1 - lumB) + sin * lumB,
	];
}

function applyColorMatrix(rgb, matrix) {
	const r = rgb.r / 255;
	const g = rgb.g / 255;
	const b = rgb.b / 255;

	return {
		r: Math.round((r * matrix[0] + g * matrix[1] + b * matrix[2]) * 255),
		g: Math.round((r * matrix[3] + g * matrix[4] + b * matrix[5]) * 255),
		b: Math.round((r * matrix[6] + g * matrix[7] + b * matrix[8]) * 255),
	};
}

let dark = css.replace(
	/(--[a-zA-Z0-9-]+):\s*(#[0-9a-fA-F]{3,6})/g,
	(match, varName, color) => {
		const hueRotatedColor = hueRotateColor(
			invertColor(color, 0.9)
		).toHexString();
		return `${varName}: ${hueRotatedColor}`;
	}
);

dark = `@media (prefers-color-scheme: dark) {
${dark}
}`;

fs.writeFileSync('./src/dark.css', dark);
