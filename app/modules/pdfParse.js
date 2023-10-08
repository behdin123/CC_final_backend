const fs = require('fs');
const pdfParse = require('pdf-parse');

async function processPdfFile(filename) {
    try {
      // Read the PDF file into a data buffer
      let dataBuffer = fs.readFileSync(filename);
  
      // Parse the PDF file
      let data = await pdfParse(dataBuffer);
  
      // Return the extracted text
      return data.text;
    } catch (error) {
      console.error(`Error reading file: ${filename}`);
      console.error(error);
      throw error;
    }
  }
  

module.exports = {
  processPdfFile
};
