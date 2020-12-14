if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const unirest = require('unirest');
const mongo = require('./mongo.js');

const app = express();

mongo.start(() => {
  mongo.get('cache', () => {
    console.log('db cache loaded');
  });
});

const getCurrency = () => {
  return new Promise((resolve, reject) => {
    const url = 'https://currency26.p.rapidapi.com/convert/USD/CLP/1';
    const req = unirest('GET', url);

    req.headers({
      'x-rapidapi-key': process.env.C26KEY,
      'x-rapidapi-host': 'currency26.p.rapidapi.com',
      'useQueryString': true
    });

    req.end((res) => {
      if (res.error) reject(res.error);
      else resolve(res.body);
    });
  });
};

const getIndicators = (indicator, date, cb) => {
  return new Promise((resolve, reject) => {
    const url = 'https://mindicador.cl/api/'+indicator+'/'+date;
    const req = unirest('GET', url);

    req.end((res) => {
      if (res.error) reject(res.error);
      else resolve(res.body);
    });
  });
};

const rejectDelay = () => {
  return new Promise((resolve, reject) => {
    setTimeout(function (reject)  {
      reject(new Error('timeout'));
    }.bind(null, reject), 5000); 
  });
};

const retry = (cb, retries=3, err) => {
  if (!retries) {
    return Promise.reject(err);
  }
  return cb().catch(err => {
    return retry(cb, (retries - 1), err);
  });
};

const retryWithDelay = async (cb) => {
  let timer = rejectDelay();
  let retries = retry(cb);
  return Promise.race([timer, retries]).finally((val) => {
    return val;
  });
};

const error400 = (res) => {
  res.status(400);
  res.send(JSON.stringify({
    code: 400,
    message: 'Invalid request'
  }));
};

const fetchData = async (date) => {
  const currency = await retryWithDelay(getCurrency);

  const getUF = getIndicators.bind(null, 'uf', date);
  const uf = await retryWithDelay(getUF);

  const getUTM = getIndicators.bind(null, 'utm', date);
  const utm = await retryWithDelay(getUTM);
  
  if (currency && currency.vl &&
      uf && uf.serie[0] && uf.serie[0].valor &&
      utm && utm.serie[0] && utm.serie[0].valor ) {
    
    return {
      'date': date,
      'indicators': {
        'dollar': currency.vl,
        'uf': uf.serie[0].valor,
        'utm': utm.serie[0].valor
      }
    };
  }
};

const getDate = () => {
  /* 
  About date:

  1. We are using the nodejs server timezone, this could be an issue
  if the client is for eg. in Japan and the server in USA, the client
  would receive a delayed currency response. It's not hard to retrieve 
  the date from the client browser, but I don't know what's the client's 
  plan, since the client date can be messed up.

  2. nodejs only supports english 'en', this would be a one line 
  with proper 'pt' support:
  const date = new Date().toLocaleDateString('pt').replace(/\//g,'-');
  https://github.com/nodejs/node/issues/8500
  */
  var date = new Date().toLocaleDateString('en').split('/');
  return [date[1],date[0],date[2]].join('-');
}

app.get('/', async (req, res) => {

  const date = getDate();

  if (mongo.data[date]) {
    console.log('data retrieved from cache');
    res.send(JSON.stringify(mongo.data[date]));

  } else {
    console.log('fetching data');
    mongo.data[date] = await fetchData(date);

    if (mongo.data[date]) {
      console.log('fetched data');
      res.send(JSON.stringify(mongo.data[date]));
      mongo.set('cache', mongo.data, () => {
        console.log('data saved to cache');
      });
    } else {
      return error400(res);
    }
  }
});

app.listen(3000, () => {
  console.clear();
  console.log('server started');
});