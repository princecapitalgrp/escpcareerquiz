import fs from 'fs';
import handler from './api/generate.js';

const envFile = fs.readFileSync('./.env', 'utf8');
const key = envFile.split('OPENAI_API_KEY=')[1].trim();
process.env.OPENAI_API_KEY = key;

const req = {
  method: 'POST',
  body: { prompt: "I am a high school student interested in accounting and philosophy." }
};
const res = {
  setHeader: () => {},
  status: (code) => ({
    json: (data) => console.log(JSON.stringify({statusCode: code, data}, null, 2)),
    end: () => console.log("ended", code)
  })
};

console.log('Testing handler...');
handler(req, res).catch(console.error);
