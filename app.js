const express = require('express')
const bodyParser = require('body-parser')
const session = require('express-session')
const MySQLStore = require('express-mysql-session')(session)
const Sequelize = require('sequelize')
const db = require('./models')
const bcrypt = require('bcryptjs')
const hbs = require('hbs')
const expressHbs = require("express-handlebars");


const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.engine('hbs', expressHbs({
    layoutsDir: 'views/layouts',
    defaultLayout: 'layout',
    extname: 'hbs'
}));
hbs.registerPartials(__dirname + '/views/partials');
app.use("/public", express.static("public"));


const User = db.user;
const Products = db.products;
const Cart = db.cart;
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const sequelize = new Sequelize('stroymag', 'root', 'm1a2d3i4y5a6r71735071', {
    dialect: 'mysql',
});
const myStore = new SequelizeStore({
    db: sequelize
});


const TWO_HOURS = 1000 * 60 * 60 * 2
const {
    PORT = 3000,
    NODE_ENV = 'development',
    SESS_NAME = 'sid',
    SESS_LIFETIME = TWO_HOURS,
    SESS_SECRET = 'ssh!quiet,it\'asecret!'
} = process.env

const IN_PROD = NODE_ENV === 'production'



app.use(session({
    name: SESS_NAME,
    resave: false,
    saveUninitialized: false,
    secret: SESS_SECRET,
    store: myStore,
    cookie: {
        maxAge: SESS_LIFETIME,
        sameSite: true,
        secure: IN_PROD
    }
}))

myStore.sync()


app.get('/', (req, res) => {
    Products.findAll({
        raw: true
    })
        .then((products) => {
            res.render('index.hbs', {
                products: products
            })
        })
        .catch(err => console.log(err));
})

app.post('/', (req, res) => {
    Cart.create({
        
    })
})

app.get('/product', (req, res) => {
    res.render('product.hbs')
})

app.get('/store', (req, res) => {
    res.render('store.hbs')
})

app.get('/profile', (req, res) => {
    if (req.session.userId) {
        User.findOne({
            raw: true,
            where: {
                id: req.session.userId
            }
        })
            .then(user => {
                if (!user) {
                    return res.status(404).send({ message: "Что-то пошло не так" })
                }
                res.render('profile.hbs', {
                    name: user.username,
                    email: user.email
                })
            })
    }
    else {
        res.redirect('/login')
    }
})



app.get('/login', (req, res) => {
    if (req.session.userId) {
        res.redirect('/profile')
    } else {
        res.render('login.hbs')
    }
})

app.get('/register', (req, res) => {
    res.render('signup.hbs')
})

app.post('/login', (req, res) => {
    User.findOne({
        where: {
            email: req.body.email
        }
    })
        .then(user => {
            if (!user) {
                return res.status(404).send({ message: "Введены неправильные данные!" });
            }
            const passwordIsValid = bcrypt.compareSync(req.body.password, user.password)
            if (!passwordIsValid) {
                return res.status(401).send({
                    message: "Введены неправильные данные!"
                });
            }
            req.session.userId = user.id;
            res.redirect('/profile');
        })
})


app.post('/register', (req, res) => {
    User.create({
        username: req.body.name,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 8)
    })
        .then(() => {
            res.send({ message: "Пользователь успешно зарегистрирован!" });
        })
        .catch(err => {
            res.status(500).send({ message: err.message });
        });
})

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return console.log(err);
        }
        res.redirect('/');
    });
})

app.listen(PORT, () => console.log(`http://localhost:${PORT}`))