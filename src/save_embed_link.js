const fs = require('fs');
const https = require('https');
const path = require('path');

const EMBEDS_FOLDER = './src/embeds';

async function saveEmbedLink(messageId, embedLink) {
  // Create the embeds folder if it doesn't exist
  if (!fs.existsSync(EMBEDS_FOLDER)) {
    fs.mkdirSync(EMBEDS_FOLDER);
  }

  // Remove query parameters from embed link
  const sanitizedEmbedLink = embedLink.split('?')[0];

  // Download the embed file
  const fileExtension = path.extname(sanitizedEmbedLink);
  const fileName = `${messageId}${fileExtension}`;
  const filePath = path.join(EMBEDS_FOLDER, fileName);

  const file = fs.createWriteStream(filePath);
  https.get(sanitizedEmbedLink, function(response) {
    response.pipe(file);
  });

  // Delete the file after 24 hours
  setTimeout(() => {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(`Error deleting embed file ${filePath}:`, err);
      } else {
        console.log(`Deleted embed file ${filePath}`);
      }
    });
  }, 24 * 60 * 60 * 1000);
}

module.exports = { saveEmbedLink };
