const qrCode = require('qrcode');
const jimp = require('jimp');
const path = require('path'); // Import the path module

async function generateQRCode(data, options = {}, logoPath) {
	try {
		// Generate QR code
		const qrCodeData = await qrCode.toDataURL(data, options);

		// Load QR code image
		const qrCodeImage = await jimp.read(qrCodeData);

		// Load logo image from the root directory
		const logoPath = path.join(__dirname, logoFileName);
		const logoImage = await jimp.read(logoPath);
		console.log('Logo path:', logoPath);
		// Calculate the position to center the logo on the QR code
		const x = (qrCodeImage.bitmap.width - logoImage.bitmap.width) / 2;
		const y = (qrCodeImage.bitmap.height - logoImage.bitmap.height) / 2;

		// Composite the logo on the QR code
		qrCodeImage.composite(logoImage, x, y);

		// Save the QR code with the logo as a file
		const filePath = 'qrCodeWithLogo.png'; // Specify the file path here
		await qrCodeImage.writeAsync(filePath);

		console.log('QR code with logo saved:', filePath);
	} catch (error) {
		console.error('Error generating QR code:', error);
		console.log('Logo path:', logoPath);
		throw error;
	}
}

module.exports = generateQRCode;
