const { exec } = require("child_process");
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function (req, res) {
    res.send(getIndexFile());
});

app.post('/commit', (req, res) =>{
    //console.log(req.body["input"]);
    let code = req.body["input"];
    fs.writeFileSync('context/main.cpp', code);
    exec("docker build \"./context/\" -t gcc", () => {
        exec("docker run --rm gcc", (error, stdout, stderr) => {
            console.log(stdout);
            res.status(200).send(JSON.stringify({stdout:stdout}))
        });
    });
});

const server = app.listen(9090, () => {
    console.log('listening on port %s...', server.address().port);
});

function getIndexFile() {
    return fs.readFileSync("index.html", "utf8");
}