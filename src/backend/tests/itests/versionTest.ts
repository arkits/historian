import app from '../../src/index';
import * as chai from 'chai';
import chaiHttp = require('chai-http');
import 'mocha';
import { expect } from 'chai';

chai.use(chaiHttp);

describe('Version API Test', () => {
    it('Check Version', (done) => {
        chai.request(app)
            .get('/api')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('name');
                expect(res.body).to.have.property('version');
                done();
            });
    });
});
