const express = require('express');
const ejs = require('ejs');
const path = require('path');
const qrCode = require('qrcode');
const exp = require('constants');
const Jimp = require('jimp');
const generateQRCode = require('./generateQR');
const qr = require('qr-image');
const fs = require('fs');

const app = express();

const generateQRCodeWithLogo = (data, logoPath, outputPath) => {
	try {
		// Validate the data
		if (!data || typeof data !== 'string') {
			throw new Error('Invalid QR code data');
		}

		const qrCode = qr.imageSync(data, { type: 'png', margin: 4 });

		// Read the logo image
		const logo = fs.readFileSync(logoPath);

		// Create a composite image with the QR code and logo in the middle
		const qrCodeWithLogo = qr.imageSync({
			qrCodeBuffer: qrCode,
			drawLogo: {
				path: logoPath,
				width: 80, // Adjust the size of the logo as needed
				height: 80, // Adjust the size of the logo as needed
			},
		});

		// Save the composite image to a file
		fs.writeFileSync(outputPath, qrCodeWithLogo);

		console.log('QR code with logo generated successfully');
	} catch (error) {
		console.error('Error generating QR code with logo:', error.message);
	}
};

// Usage
// const data = 'YourQRcodedatahere';
// const logoPath = './logo.png';
// const outputPath = './qrcode_with_logo.png';

const PORT = process.env.port || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'view'));

app.use(express.static('public'));

const text =
	'https://play.google.com/store/apps/details?id=com.wnapp.id1694165800345&pcampaignid=web_share'; // Text or data to encode in the QR code
const logoPath = './rapid-logo1.png'; // Path to the logo image
const qrCodePath = './glomax-app.png';

const qrCodeSize = 300; // Size of the QR code image in pixels
const logoSize = qrCodeSize * 0.3; // Size of the logo image in pixels (adjust as needed)
const margin = 2; // Margin size in pixels (adjust as needed)// Path to save the QR code image
// Calculate the size of the canvas based on the QR code size and margin
const canvasSize = qrCodeSize + margin * 2;
app.get('/', (req, res, next) => {
	// Generate the QR code
	// qrCode.toFile(qrCodePath, text, async (error) => {
	// 	if (error) {
	// 		console.error(error);
	// 	} else {
	// 		console.log('QR code generated successfully!');

	// 		try {
	// 			// Load the QR code image and the logo image using Jimp
	// 			const [qrCodeImage, logoImage] = await Promise.all([
	// 				Jimp.read(qrCodePath),
	// 				Jimp.read(logoPath),
	// 			]);

	// 			// Resize the logo image to fit in the middle of the QR code
	// 			const logoSize =
	// 				Math.min(qrCodeImage.bitmap.width, qrCodeImage.bitmap.height) * 0.2; // Adjust the logo size as needed
	// 			logoImage.resize(logoSize, logoSize);

	// 			// Calculate the position to place the logo in the middle of the QR code
	// 			const x = (qrCodeImage.bitmap.width - logoImage.bitmap.width) / 2;
	// 			const y = (qrCodeImage.bitmap.height - logoImage.bitmap.height) / 2;

	// 			// Compose the QR code and the logo image
	// 			qrCodeImage.composite(logoImage, x, y);

	// 			// Save the final QR code image with the logo
	// 			qrCodeImage.write(qrCodePath, () => {
	// 				console.log('QR code with logo saved successfully!');
	// 			});
	// 		} catch (error) {
	// 			console.error('Error:', error);
	// 		}
	// 	}
	// });

	qrCode.toFile(qrCodePath, text, async (error) => {
		if (error) {
			console.error(error);
		} else {
			console.log('QR code generated successfully!');

			try {
				// Create a new canvas with the specified size
				const canvas = new Jimp(canvasSize, canvasSize, 0xffffffff); // 0xffffffff represents white color

				// Load the QR code image and the logo image using Jimp
				const [qrCodeImage, logoImage] = await Promise.all([
					Jimp.read(qrCodePath),
					Jimp.read(logoPath),
				]);

				// Resize the QR code image
				qrCodeImage.resize(qrCodeSize, qrCodeSize);

				// Resize the logo image
				logoImage.resize(logoSize, logoSize);

				// Calculate the position to place the QR code in the middle of the canvas
				const qrCodeX = (canvasSize - qrCodeImage.bitmap.width) / 2;
				const qrCodeY = (canvasSize - qrCodeImage.bitmap.height) / 2;

				// Calculate the position to place the logo in the middle of the QR code
				const logoX = qrCodeX + (qrCodeSize - logoImage.bitmap.width) / 2;
				const logoY = qrCodeY + (qrCodeSize - logoImage.bitmap.height) / 2;

				// Composite the QR code onto the canvas
				canvas.composite(qrCodeImage, qrCodeX, qrCodeY);

				// Composite the logo onto the QR code
				canvas.composite(logoImage, logoX, logoY);

				// Save the final QR code image with the logo and margin
				canvas.write(qrCodePath, () => {
					console.log('QR code with logo and margin saved successfully!');
				});
			} catch (error) {
				console.error('Error:', error);
			}
		}
	});

	res.send('Hello, QR code!');
});

app.post('/scan', (req, res, next) => {
	const input_text = req.body.text;
	qrcode.toDataURL(input_text, (err, src) => {
		if (err) res.send('Something went wrong!!');
		res.render('scan', {
			qr_code: src,
		});
	});

	// qr code to svg and save it to file
	// qrcode.toString(input_text, { type: 'svg' }, (err, svg) => {
	// 	if (err) res.send('Something went wrong!!');
	// 	fs.writeFileSync('./qr-code.svg', svg);
	// });

	// // qr code to png and save it to file
	// qrcode.toFile('./qr-code.png', input_text, (err) => {
	// 	if (err) res.send('Something went wrong!!');
	// });

	// create qr code to png with a logo in middle and save it to file
	qrcode.toFile(
		'./qr-code-logo.png',
		{
			content: input_text,
			errorCorrectionLevel: 'H',
			color: {
				dark: '#00F', // Blue dots
				light: '#0000', // Transparent background
			},
		},
		(err) => {
			if (err) res.send('Something went wrong!!');
		}
	);
});
app.listen(PORT, () => {
	console.log(`Server is working on http://localhost:${PORT}`);
});
