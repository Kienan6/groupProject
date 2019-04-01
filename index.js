const express = require('express')
const app = express()

//app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send('HEY!')
})
app.locals.title = "new app"
app.listen(3000, () => console.log('Server running on port 3000'))

/*app.get('/', function (req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.send("Hello World!");
})

app.listen(3000); quinn's code */
