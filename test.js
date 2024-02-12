import process from 'node:process';
import fs from 'node:fs';

const port = process.env.PORT;

async function main() {
  const data = await fetch(`http://localhost:${port}/api/users/`)
  const dataJson = await data.json();
  console.log('Initially data is empty');
  console.assert(dataJson.length === 0, 'data %s is present', dataJson);

  console.log('here')
  const userData = await fetch(`http://localhost:${port}/api/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify({name:"Maksat", age:21, hobbies:[]})
  });
  const userDataJson = await userData.json();
  console.log(userDataJson);
  console.log('Data added and returned')
  console.assert(userDataJson !== undefined, 'deta is not present')
}main()
