import sharp from 'sharp';

// Check if the correct number of arguments is provided
if (process.argv.length !== 6) {
	// eslint-disable-next-line no-console
	console.log(
		'Usage: node pad.js <input_image> <canvas_width> <canvas_height> <output_image>'
	);
	process.exit(1);
}

// Assign arguments to variables
const [, , inputImage, canvasWidth, canvasHeight, outputImage] = process.argv;

async function padImage() {
	try {
		// Get the dimensions of the input image
		const metadata = await sharp(inputImage).metadata();
		const imageWidth = metadata.width;
		const imageHeight = metadata.height;

		// Calculate the position to center the image on the canvas
		const left = Math.floor((parseInt(canvasWidth) - imageWidth) / 2);
		const top = Math.floor((parseInt(canvasHeight) - imageHeight) / 2);

		// Create a transparent canvas and composite the input image onto it
		await sharp({
			create: {
				width: parseInt(canvasWidth),
				height: parseInt(canvasHeight),
				channels: 4,
				background: { r: 0, g: 0, b: 0, alpha: 0 },
			},
		})
			.composite([
				{
					input: inputImage,
					top,
					left,
				},
			])
			.toFile(outputImage);

		// eslint-disable-next-line no-console
		console.log(`Padded image saved as ${outputImage}`);
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error('An error occurred:', error);
	}
}

padImage();
