<<<<<<< HEAD
const express = require('express')
const app = express()
app.get('/', (req, res) => {
  res.send('HEY!')
})
app.locals.title = "new app"
app.listen(3000, () => console.log('Server running on port 3000'))
=======
const express = require("express");
const app = express();

app.get('/', function (req, res) {
  res.send("Hello World!");
})

app.listen(3000);
>>>>>>> 50fe8be219a24a20661a0f5898393cceeb061872
