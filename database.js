const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('db.sqlite');

const POST_SCHEMA = `
  CREATE TABLE IF NOT EXISTS post (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(50) NOT NULL,
    content VARCHAR(140)
  )
  `;

const USER_SCHEMA = `
  CREATE TABLE IF NOT EXISTS user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(40) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
  )
  `;

const COMMENT_SCHEMA = `
    CREATE TABLE IF NOT EXISTS comment (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER REFERENCES post(id),
      user_id INTEGER REFERENCES user(id),
      content VARCHAR(140)
    )
  `;

const INSERT_USER_1 = `
    INSERT OR IGNORE INTO user (name, email, password)
    VALUES( 'Andrew', 'a@a.a', '123') 
`;

const INSERT_POST_1 = `
    INSERT OR IGNORE INTO post (title, content)
    VALUES( 'First Post', 'This is my first post :)') 
`;

db.serialize(() => {
  db.run('PRAGMA foreign_keys=ON');
  db.run(POST_SCHEMA);
  db.run(USER_SCHEMA);
  db.run(COMMENT_SCHEMA);
  db.run(INSERT_USER_1);
  db.run(INSERT_POST_1);

  db.each('SELECT * FROM user', (err, usuario) => {
    console.log('Usuario: ');
    console.log(usuario);
  });
});

process.on('SIGINT', () =>
  db.close(() => {
    process.exit(0);
  })
);

module.exports = db;
