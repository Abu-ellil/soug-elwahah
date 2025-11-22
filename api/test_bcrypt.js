const bcrypt = require('bcryptjs');

const hash = '$2a$12$JA14I.gS08pB2ft1WzX.g.ku.L1EukEJsKQF9bvnZST9szkvbeJJ6';
const password = '111111';

bcrypt.compare(password, hash).then(result => {
  console.log('Password matches:', result);
});