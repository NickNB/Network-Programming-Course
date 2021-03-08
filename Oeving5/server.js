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

if(!fs.existsSync('./context')) {
    fs.mkdirSync('./context');

    fs.writeFileSync('./context/Dockerfile',
        'FROM gcc:9.3.0\n' +
        'COPY main.cpp /\n' +
        'RUN g++ -o main main.cpp\n' +
        'CMD ["./main"]');

    fs.writeFileSync('./context/main.cpp', '');
}

function getIndexFile() {
    return fs.readFileSync("index.html", "utf8");
}