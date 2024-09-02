const express = require('express');
const { createCanvas, loadImage } = require('canvas');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/generate-image', async (req, res) => {
  const { u, v, p } = req.query;

  // Create a canvas
  const canvas = createCanvas(800, 400);
  const ctx = canvas.getContext('2d');

  // Draw background with gradient
  const gradient = ctx.createLinearGradient(0, 0, 800, 400);
  gradient.addColorStop(0, '#1F1F1F'); // Dark grey
  gradient.addColorStop(1, '#2C2C2C'); // Slightly lighter dark grey
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 800, 400);

  // Get gradient color data
  const getAverageColor = () => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    let r = 0, g = 0, b = 0;
    let count = 0;

    for (let i = 0; i < data.length; i += 4) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      count++;
    }

    r = Math.floor(r / count);
    g = Math.floor(g / count);
    b = Math.floor(b / count);

    return `rgb(${r},${g},${b})`;
  };

  const averageColor = getAverageColor();
  // console.log(`Average gradient color: ${averageColor}`);

  try {
    // Draw user profile picture if provided
    if (p) {
      const userProfileImage = await loadImage(p);

      // Save current canvas state before clipping
      ctx.save();

      // Draw a circle and clip to make the image circular
      ctx.beginPath();
      ctx.arc(100, 100, 75, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 10;
      ctx.stroke();
      ctx.clip();

      // Draw the user profile picture inside the clipped area
      ctx.drawImage(userProfileImage, 25, 25, 150, 150);

      // Restore the previous canvas state to stop clipping
      ctx.restore();
    }

    // Draw the username text
    ctx.font = 'bold 28px Arial';
    ctx.fillStyle = 'white';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 10;
    ctx.fillText(`${u}'s Hashnode Pulse`, 200, 70);

    // Draw total views text
    ctx.font = 'bold 48px Arial';
    ctx.fillText(`Total Views: ${v}`, 200, 150);

    // Draw an additional engaging message
    ctx.font = '24px Arial';
    ctx.fillText(`"Keep up the great work and reach new heights!" 🚀`, 200, 200);

    // Draw the Hashnode logo
    const logo = await loadImage('./hashnode.png');
    ctx.drawImage(logo, 650, 30, 100, 100);

    // Convert canvas to image buffer
    const buffer = canvas.toBuffer('image/png');

    // Send the image
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
