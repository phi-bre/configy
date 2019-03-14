// Main test file
import express from "express";

const app = express();

// Setup
import configy from "../";

const options = {
    descs: ['./config.desc.js'],
    directory: __dirname
}
configy(options);

/*
app.use('/configy', );

// Start app
const port = 3000;
app.listen(port, () => {
    console.log('Server listening on: ' + port);
});
*/