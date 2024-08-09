const PDFDocument = require('pdfkit');
const fs = require('fs');

function generatePDF(details) {
    const outputDir = 'output';

    // Ensure the output directory exists
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const pdfPath = `${outputDir}/dynamic_receipt.pdf`;
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(pdfPath));

    // Load background image
    doc.image('./Public/SendImage/IMG20240731133117.jpg', 0, 0, { width: 595.28, height: 841.89 });

    // Set font color to white and increase font size
    doc.fontSize(20).fillColor('white').font('Helvetica-Bold');

    // Adjusted positions
    doc.text(` ${details.name}`, 250, 310);  
    doc.text(` ${details.address}`, 250, 350);      
    doc.text(` ${details.phone}`, 110, 390);    
    doc.text(` ${details.email}`, 250, 390);       // Adjust as needed
    // doc.text(` ${details.parentName}`, 150, 370);  
    doc.text(` ${details.donationAmount}`, 250, 510); // Adjust as needed
    doc.text(` ${details.paymentMethod}`, 250, 750); // Adjust as needed

    doc.end(); // Finalize the PDF and write it to the file system

    return pdfPath; // Return the path to the generated PDF
}

module.exports = {
    generatePDF
};
