if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const mongodb = require('mongodb');

const mongo = {
  url: process.env.MONGO_CONN,
  collectionName: 'collection',
  doc: { document: 'prueba' },

  client: new mongodb.MongoClient(process.env.MONGO_CONN, {
    useUnifiedTopology: true
  }),

  start: function (cb) {
    mongo.connect((db) => {
      mongo.db = db;
      mongo.collection = db.collection(mongo.collectionName);
      mongo.get('cache', (data) => { 
        mongo.data = data; 
        if (cb) cb(mongo);
      });
    });
  },

  connect: function(cb) {
    mongo.client.connect(mongo.logError('connection failed', cb));
  },

  get: function(name, cb) {
    mongo.collection.findOne(
      mongo.doc, 
      mongo.logError('get('+name+') failed', cb, name)
    );
  },

  set: function(name, val, cb) {
    mongo.collection.updateOne(
      mongo.doc, 
      { $set: { [name]: val } },
      mongo.logError('set('+name+') failed', cb, name)
    );
  },

  logError: function (str, cb, name) {
    return function (err, client) { 
      if (err) console.log('MongoDB '+str +': '+ err.message);
      else if (cb) {
        var data = client.db ? client.db() : client;
        cb(name ? (data[name] || '') : data); 
      }
    };
  }
};

module.exports = mongo;