import app from '../../src/index';
import * as chai from 'chai';
import chaiHttp = require('chai-http');
import 'mocha';
import { expect } from 'chai';
import { createBasicAuthHeader } from '../../src/utils';

chai.use(chaiHttp);

let user = null;

describe('User API Test', () => {
    it('Register User', (done) => {
        let body = {
            name: 'Test User',
            username: 'testUser',
            password: 'password123'
        };
        chai.request(app)
            .post('/api/users/register')
            .send(body)
            .end((err, res) => {
                expect(res).to.have.status(200);

                expect(res.body).to.have.property('message');
                expect(res.body.message).to.equal('Registered User!');

                expect(res.body).to.have.property('user');

                // set as global user for other tests
                user = res.body.user;

                done();
            });
    });
    it('Update User - Negative', (done) => {
        let updatedUser = user;
        updatedUser.name = 'Updated Test User';

        chai.request(app)
            .post('/api/users/update')
            .send(updatedUser)
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
    it('Update User - Positive', (done) => {
        let updatedUser = user;
        updatedUser.name = 'Updated Test User';

        chai.request(app)
            .post('/api/users/update')
            .send(updatedUser)
            .set({
                Authorization: createBasicAuthHeader('testUser', 'password123')
            })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('message');
                expect(res.body.message).to.equal('Updated User!');
                expect(res.body).to.have.property('user');

                // check if user's name updated
                expect(res.body.user.name).to.equal('Updated Test User');

                // check if id remains
                expect(res.body.user.id).to.equal(user.id);
                done();
            });
    });
    it('Delete User - Negative - Wrong Creds', (done) => {
        chai.request(app)
            .post('/api/users/delete')
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
    it('Delete User - Positive', (done) => {
        chai.request(app)
            .post('/api/users/delete')
            .set({
                Authorization: createBasicAuthHeader('testUser', 'password123')
            })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('message');
                expect(res.body.message).to.equal('Deleted User!');
                done();
            });
    });
    it('Delete User - Negative - Double Delete', (done) => {
        chai.request(app)
            .post('/api/users/delete')
            .set({
                Authorization: createBasicAuthHeader('testUser', 'password123')
            })
            .end((err, res) => {
                expect(res.body).to.have.property('error');
                expect(res.body.error).to.equal('Unauthorized!');
                done();
            });
    });
});
