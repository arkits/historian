import app from '../../src/index';
import * as chai from 'chai';
import chaiHttp = require('chai-http');
import 'mocha';
import { expect } from 'chai';
import { createBasicAuthHeader } from '../../src/utils';

chai.use(chaiHttp);

describe('History API Test', () => {
    before(async function () {
        // register test user
        let body = {
            name: 'Test User',
            username: 'testUser',
            password: 'password123'
        };
        let res = await chai.request(app).post('/api/users/register').send(body);
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('message');
        expect(res.body.message).to.equal('Registered User!');
        expect(res.body).to.have.property('user');
    });

    after(async function () {
        // delete test user
        let res = await chai
            .request(app)
            .post('/api/users/delete')
            .set({
                Authorization: createBasicAuthHeader('testUser', 'password123')
            });
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('message');
        expect(res.body.message).to.equal('Deleted User!');
    });

    it('Get History - Negative - No Auth', (done) => {
        chai.request(app)
            .get('/api/history')
            .end((err, res) => {
                expect(res).to.have.status(401);
                expect(res.body).to.have.property('error');
                expect(res.body.error).to.equal('Unauthorized!');
                done();
            });
    });

    it('Get History - Positive', (done) => {
        chai.request(app)
            .get('/api/history')
            .set({
                Authorization: createBasicAuthHeader('testUser', 'password123')
            })
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });

    it('Get History - Negative - Wrong Password', (done) => {
        chai.request(app)
            .get('/api/history')
            .set({
                Authorization: createBasicAuthHeader('testUser', 'wrongPassword')
            })
            .end((err, res) => {
                expect(res).to.have.status(401);
                expect(res.body).to.have.property('error');
                expect(res.body.error).to.equal('Unauthorized!');
                done();
            });
    });

    it('Add History - Negative - No Auth', (done) => {
        chai.request(app)
            .post('/api/history/add')
            .end((err, res) => {
                expect(res).to.have.status(401);
                expect(res.body).to.have.property('error');
                expect(res.body.error).to.equal('Unauthorized!');
                done();
            });
    });
});
