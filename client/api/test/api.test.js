const request = require('supertest');

const app = require('../src/app');

describe('GET /api/', () => {
  it('responds with a json message', (done) => {
    request(app)
      .get('/api')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, {
        message: 'API - 👋🌎🌍🌏'
      }, done);
  });
});

// Send a post request test to the back-end API
describe('POST /api/waymessages', () => {
  it('responds with inserted waymessage', (done) => {
    const requestObj = {
      username: "j",
      message: "hey buddy",
      latitude: -89,
      longitude: 140,
    };

    const responseObj = {
      ...requestObj,
      _id: "5f25b6c03852bf258c919fc9",
      date: "2020-08-01T18:38:56.613Z"
    }

    request(app)
      .post('/api/waymessages')
      .send(requestObj)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(res => {
        res.body._id = "5f25b6c03852bf258c919fc9";
        res.body.date = "2020-08-01T18:38:56.613Z";
      })
      .expect(200, responseObj, done);
  });

  it('can sign up with a name that has diacritics', (done) => {
    const requestObj = {
      username: "À-ÿ",
      message: "cool post request",
      latitude: -20,
      longitude: 94
    };

    const responseObj = {
      ...requestObj,
      _id: "5f25b6c03852bf258c919fc9",
      date: "2020-08-01T18:38:56.613Z"
    }
    
    request(app)
      .post('/api/waymessages')
      .send(requestObj)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(res => {
        // response comes from server responding to POST request
        // res.json sends userMessage {uname, msg, lat, lng, _id, date}
        res.body._id = "5f25b6c03852bf258c919fc9";
        res.body.date = "2020-08-01T18:38:56.613Z";
      })
      .expect(200, responseObj, done);
  });
});
