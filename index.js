require('dotenv').config()
const express = require('express');
const unirest = require('unirest');
const app = express();

/* TODO:
☑ get currency26
☑ get mindicador
☐ mongodb cache
☐ retries timeout
☐ invalid 400
☑ JSON response
*/

const getCurrency = () => {
  return new Promise(resolve => {
    const req = unirest('GET', 'https://currency26.p.rapidapi.com/convert/USD/CLP/1');

    req.headers({
      'x-rapidapi-key': process.env.C26KEY,
      'x-rapidapi-host': 'currency26.p.rapidapi.com',
      'useQueryString': true
    });

    req.end((res) => {
      if (res.error) throw new Error(res.error);
      resolve(res.body);
    });
  });
};

const getIndicators = (indicator, date, cb) => {
  return new Promise(resolve => {
    const req = unirest('GET', 'https://mindicador.cl/api/'+indicator+'/'+date);

    req.headers({
      'Content-Type': 'application/JSON'
    });

    req.end((res) => {
      if (res.error) throw new Error(res.error);
      resolve(res.body);
    });
  });
};

app.get('/', async (req, res) => {

  const date = new Date().toLocaleDateString('pt').replace(/\//g,'-');

  const currency = await getCurrency();
  const uf = await getIndicators('uf', date);
  const utm = await getIndicators('utm', date);

  const data = {
    'date': date, // date or serie[0].fecha ???
    'indicators': {
      'dollar': currency.vl,
      'uf': uf.serie[0].valor,
      'utm': utm.serie[0].valor
    }
  }
  
  res.send(JSON.stringify(data));
});

app.listen(3000, () => {
  console.clear();
  console.log('server started');
});