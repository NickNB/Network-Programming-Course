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
    exec("docker build \"./context/\" -t gcc", (error, stdout, stderr) => {
        if(error != null){
            res.send(JSON.stringify({stdout:stdout}));
            return;
        }
        exec("docker run --rm gcc", (error, stdout, stderr) => {
            res.status(200).send(JSON.stringify({stdout:stdout}));
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
    return "<!DOCTYPE html>\n" +
        "<html>\n" +
        "<head>\n" +
        "    <title>Oeving 5</title>\n" +
        "    <style>\n" +
        "        * {\n" +
        "            padding: 0;\n" +
        "            margin: 0;\n" +
        "            box-sizing: border-box;\n" +
        "            overflow-x: hidden;\n" +
        "        }\n" +
        "        body {\n" +
        "            background-color: #17252a;\n" +
        "        }\n" +
        "        .content {\n" +
        "            width: 75vw;\n" +
        "            margin:auto;\n" +
        "        }\n" +
        "        textarea {\n" +
        "            width: 100%;\n" +
        "            height: 50vh;\n" +
        "            margin-top: 1rem;\n" +
        "            outline: none;\n" +
        "            border: 0;\n" +
        "            border-radius: 0.2rem;\n" +
        "            padding: 1rem;\n" +
        "            font-size: 1.2rem;\n" +
        "            background-color: #fff;\n" +
        "            color: #272d36;\n" +
        "            resize: none;\n" +
        "        }\n" +
        "        .button-cont {\n" +
        "            width:30%;\n" +
        "            margin: auto;\n" +
        "        }\n" +
        "        button {\n" +
        "            align-content: center;\n" +
        "            margin-top: 2rem;\n" +
        "            border: 0;\n" +
        "            border-radius: 0.2rem;\n" +
        "            width: 100%;\n" +
        "            height: 3rem;\n" +
        "            font-size: 1.2rem;\n" +
        "        }\n" +
        "        button:hover {\n" +
        "            background-color: grey;\n" +
        "        }\n" +
        "        .out-cont {\n" +
        "            width: 100%;\n" +
        "            margin-top: 2rem;\n" +
        "            background-color: #fff;\n" +
        "            min-height: 20rem;\n" +
        "            border-radius: 0.5rem;\n" +
        "            padding: 1rem;\n" +
        "            font-size: 1.1rem;\n" +
        "            border: 1px solid #272d36;\n" +
        "        }\n" +
        "    </style>\n" +
        "</head>\n" +
        "<body>\n" +
        "<div class=\"content\">\n" +
        "    <textarea id=\"input\" name=\"in\" rows=\"4\" cols=\"50\" oninput='this.style.height = \"\";this.style.height = this.scrollHeight + \"px\"'></textarea><br>\n" +
        "    <div class=\"button-cont\"><button id=\"commit\" onclick=\"sendCode()\">Compile and run</button></div>\n" +
        "    <div class=\"out-cont\"><p id=\"output\"></p></div>\n" +
        "</div>\n" +
        "\n" +
        "<script>\n" +
        "    function sendCode() {\n" +
        "        let obj = {input: document.getElementById(\"input\").value}\n" +
        "        console.log(obj.input);\n" +
        "        fetch(\"http://localhost:9090/commit\", {\n" +
        "            method: 'POST',\n" +
        "            headers: {\n" +
        "                'Content-Type': 'application/json'\n" +
        "            },\n" +
        "            body: JSON.stringify(obj)\n" +
        "        }).then((res) => res.json()).then(data => {\n" +
        "            console.log(data.stdout);\n" +
        "            document.getElementById(\"output\").innerText = data.stdout;\n" +
        "        });\n" +
        "    }\n" +
        "</script>\n" +
        "</body>\n" +
        "</html>";
}