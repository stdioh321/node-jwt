const uuid = require('uuid');

const http = require('http');
const express = require('express');
const app = express();

// const bodyParser = require('body-parser');
const path = require('path');

require("dotenv-safe").config({
    path: ".env.example"
});
const jwt = require('jsonwebtoken');


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.text());


app.get('/', (req, res, next) => {
    // res.json({ message: "Tudo ok por aqui!" });
    res.sendFile(path.join(__dirname + "/pages/login-form.html"));
})

app.get('/clientes', (req, res, next) => {
        console.log("Retornou todos clientes!");
        res.json([{ id: 1, nome: 'luiz' }]);
    })
    //authentication
app.post('/login', (req, res, next) => {
    //esse teste abaixo deve ser feito no seu banco de dados
    console.log(req.body);
    if (req.body.user === 'luiz' && req.body.password === '123') {
        //auth ok
        const id = uuid.v4().toString();
        let secret = process.env.SECRET;

        const token = jwt.sign({ id }, process.env.SECRET, {
            expiresIn: 300 // expires in 5min
        });
        return res.json({ auth: true, token: token });
    }

    res.status(500).json({ message: 'Login inválido!' });
})



app.get("/test-token", verifyJWT)

function verifyJWT(req, res, next) {
    const token = req.headers['x-access-token'] || req.query.token;
    const secret = req.query.secret || process.env.SECRET;
    console.log("Token: " + token);
    if (!token) return res.status(401).json({ auth: false, message: 'Nenhum token' });

    jwt.verify(token, secret, function(err, decoded) {
        if (err) return res.status(500).json({ auth: false, message: 'Falha ao autenticar o token.' });

        // se tudo estiver ok, salva no request para uso posterior
        let id = decoded.id;
        req.userId = id;
        console.log(id);
        return res.send(`OK<br /> ID: ${id}`)
            // next();
    });
}

const server = http.createServer(app);
server.listen(3000);
console.log("Servidor escutando na porta 3000...")