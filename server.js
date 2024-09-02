const express = require('express');
const { createCanvas, loadImage, registerFont } = require('canvas');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

// Register custom font
registerFont(path.join(__dirname, 'font', 'Roboto-Bold.ttf'), { family: 'Roboto', weight: 'bold' });

async function generateImage(username, views, profilePicture) {
  const canvas = createCanvas(1200, 630);
  const ctx = canvas.getContext('2d');

  // Background
  const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
  gradient.addColorStop(0, '#4A148C');
  gradient.addColorStop(1, '#311B92');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1200, 630);

  // Profile picture
  if (profilePicture) {
    const userProfileImage = await loadImage(profilePicture);
    ctx.save();
    ctx.beginPath();
    ctx.arc(150, 150, 100, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(userProfileImage, 50, 50, 200, 200);
    ctx.restore();
  }

  // Text
  ctx.font = 'bold 60px Roboto';
  ctx.fillStyle = 'white';
  ctx.fillText(`${username}'s Hashnode Pulse`, 300, 150);

  ctx.font = 'bold 80px Roboto';
  ctx.fillText(`Total Views: ${views}`, 300, 250);

  ctx.font = '40px Roboto';
  ctx.fillText('Powered by HashPulse', 300, 350);

  // Hashnode logo
  const logo = await loadImage(path.join(__dirname, 'images', 'hashnode.png'));
  ctx.drawImage(logo, 1000, 500, 150, 150);

  return canvas.toBuffer('image/png');
}

app.get('/share/:username/:views', async (req, res) => {
  const { username, views } = req.params;
  const profilePicture = req.query.profilePicture || '';

  const imageUrl = `${req.protocol}://${req.get('host')}/generate-image/${username}/${views}?profilePicture=${encodeURIComponent(profilePicture)}`;

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${username}'s Hashnode Pulse</title>
      <meta name="twitter:card" content="summary_large_image">
      <meta name="twitter:title" content="${username}'s Hashnode Pulse">
      <meta name="twitter:description" content="Check out ${username}'s Hashnode stats! Total views: ${views}">
      <meta name="twitter:image" content="${imageUrl}">
    </head>
    <body>
      <script>
        window.location.href = "https://hash-pulse.vercel.app/";
      </script>
    </body>
    </html>
  `);
});

app.get('/generate-image/:username/:views', async (req, res) => {
  const { username, views } = req.params;
  const profilePicture = req.query.profilePicture || '';

  try {
    const buffer = await generateImage(username, views, profilePicture);
    res.contentType('image/png');
    res.send(buffer);
  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).send('Error generating image');
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});