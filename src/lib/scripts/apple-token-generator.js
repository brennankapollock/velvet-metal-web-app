import { readFileSync } from 'fs';
import pkg from 'jsonwebtoken';

const { sign } = pkg;

const privateKey = readFileSync('../../../apple-auth-key.p8').toString();
const teamId = 'DYW4AG9442';
const keyId = '6KVDS6765S';

const token = sign({}, privateKey, {
  algorithm: 'ES256',
  expiresIn: '180d', // Apple allows max 6 months
  issuer: teamId,
  header: {
    alg: 'ES256',
    kid: keyId,
  },
});

console.log(token);
