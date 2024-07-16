const { createCanvas, loadImage } = require('canvas');
var express = require('express');
var router = express.Router();
let path = require('path');
let Knex = require('../database/index');

router.get('/', (req, res) => {
  const images = req.app.locals.getImagePaths();
  console.log(images);
  res.render('pages/home', {
    images,
  });
});

router.post('/webcounter', async (req, res) => {
  const params = req.body;
  console.log('body paramater ==>', params);
  const result = await Knex('hits').max({ page: 'page' });
  const nextPage = result[0].page + 1;
  await Knex('hits').insert({
    page: nextPage,
    counter: params.count,
    url: params.pageurl,
  });
  const data = `<a href="https://www.hitwebcounter.com" target="_blank"><img src="http://localhost:8000/counter/counter.php?page=${nextPage}&style=${params.style}&nbdigits=${params.number_digits}&type=${params.type}&initCount=${params.count}&pageurl=${params.pageurl}" title="Counter Widget" border = "0"/></a>`;
  res.render('pages/webcounter', { data });
});

router.get('/counter/counter.php', async (req, res) => {
  const { style, nbdigits, type, page, initCount } = req.query;
  console.log(initCount);
  const digitsDir = path.join(
    __dirname,
    `../public/images/digits/style_${style}`
  );

  let count = 0;

  try {
    if (type === 'page') {
      const rows = await Knex('hits').where({ page }).select('counter');
      if (rows.length > 0) {
        await Knex('hits')
          .where({ page })
          .update({ counter: Knex.raw('counter + 1') });
        count = rows[0].counter + 1;
      } else {
        await Knex('hits').insert({ page, counter: initCount });
        count = 1;
      }
    } else if (type === 'ip') {
      const ip = req.ip;
      const rows = await Knex('ip_hits').where({ page, ip }).select('ip');
      if (rows.length === 0) {
        await Knex('ip_hits').insert({ page, ip });
      }
      const ipCountRows = await Knex('ip_hits')
        .where({ page })
        .count({ counter: 'ip' });
      const pageCountRows = await Knex('hits')
        .where({ page })
        .select('counter');
      count =
        ipCountRows[0].counter +
        (pageCountRows.length > 0 ? pageCountRows[0].counter : 0);
    }

    const numDigits = Math.max(count.toString().length, nbdigits);
    const paddedCount = count.toString().padStart(numDigits, '0');
    const digits = paddedCount.split('');

    const digitImages = await Promise.all(
      digits.map((digit) => {
        return loadImage(path.join(digitsDir, `${digit}.png`));
      })
    );

    const width = digitImages[0].width;
    const height = digitImages[0].height;
    const canvas = createCanvas(width * numDigits, height);
    const ctx = canvas.getContext('2d');
    digitImages.forEach((img, i) => {
      ctx.drawImage(img, i * width, 0);
    });
    res.setHeader('Content-Type', 'image/png');
    canvas.createPNGStream().pipe(res);
  } catch (err) {
    console.error('Error generating image:', err);
    res.status(500).send('Internal Server Error');
    // res.status(500).sendFile(path.join(__dirname, 'error.png'));
  }
});

module.exports = router;
