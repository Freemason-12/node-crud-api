import http from 'node:http';
import process from 'node:process';

const users = new Map();
let latestId = 1;

function newUser(id, username, age, hobbies) {
  return {id: id, username: username, age: age, hobbies: hobbies, };
}
// users.set(1, newUser(1, "Alisher", 20, ["reactjs", "javascript"]));
// users.set(2, newUser(2, "Alan", 21, ["PHP", "project management"]));
// users.set(3, newUser(3, "Maksat", 21, ["programming", "drawing"]));

function requestBody(request, response, id) {
  let body = ''
  request.setEncoding('utf8');
  request.on('data', (chunk) => { body = chunk; }).on('end', () => {
    const jsonUser = JSON.parse(body);
    if(!jsonUser.username || !jsonUser.age || !jsonUser.hobbies) {
      console.log('Bad request');
      response.statusCode = 400;
      response.end();
      return;
    }
    const user = newUser(id, jsonUser.username, jsonUser.age, jsonUser.hobbies);
    users.set(id, user);
    response.setHeader('content-type', 'application/json');
    response.write(JSON.stringify(user));
    response.end();
  });
}

function error404(response) {
  response.statusCode = 404;
  response.write('<h1>404 Page not found</h1>\n<p>Sorry this page is not found</p>');
}

const server = http.createServer((request, response) => {
  response.setHeader("Content-Type", "text/html; charset=utf-8");
  response.statusCode = 200;

  switch (true) {

    case /\/api\/users\/[^0-9]+/.test(request.url):
      response.statusCode = 400;
      response.end();
    break;

    case /\/api\/users\/[0-9]+\/*$/.test(request.url):
      const u = request.url.split('/');
      const userId = u[u.length - 1] === '' ?
            Number(u[u.length - 2]) :
            Number(u[u.length - 1]);

      if(isNaN(userId)) { response.statusCode = 400; break; }

      switch(request.method) {
        case 'GET':
          if(users.get(userId) !== undefined) {
            response.setHeader('content-type', 'application/json');
            response.write(JSON.stringify(users.get(userId)));
          } else error404(response);
          response.end();
        break;

        case 'PUT':
          if(users.get(userId) === undefined) {
            error404(response);
            response.end();
          } else requestBody(request, response, userId);
        break;

        case 'DELETE':
          if(users.get(userId) === undefined) error404(response);
          else { users.delete(userId); response.statusCode = 204; }
          response.end();
        break;
      }
    break;

    case /\/api\/users\/*$/.test(request.url):
      switch(request.method) {
        case 'GET':
          response.setHeader('content-type', 'application/json');
          const responseInfo = [];
          for(let [_, v] of users) responseInfo.push(v);
          response.write(JSON.stringify(responseInfo));
          response.end();
        break;

        case 'POST':
          requestBody(request, response, latestId);
        break;

        default:
          response.statusCode = 400;
          response.end();
        break;
      }
    break;

    default:
      error404(response);
      response.end();
    break;
  }
});


server.listen(process.env.PORT);
