import express, { Express } from "express";
import ejs from "ejs";
import dotenv from "dotenv";
import path, { format } from "path";
import { connect, login } from "./database";

dotenv.config();

const app : Express = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set('views', path.join(__dirname, "views"));
app.set("port", process.env.PORT || 3000);


app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await login(email, password);
        res.redirect('/landing-page');
    } catch (error) {
        res.render('index', { errorMessage: error.message });
    }
});

app.get("/", async (req, res) => {
    res.render("index");
});

app.get('/registration', (req, res) => {
    res.render('registration'); 
});

app.get('/homepage_fortnite', (req, res) => {
    res.render('homepage_fortnite'); 
});

app.get('/blacklist_detail', (req, res) => {
    res.render('blacklist_detail'); 
});

app.get('/blacklisted_characters', (req, res) => {
    res.render('blacklisted_characters'); 
});

app.get('/character_detail', (req, res) => {
    res.render('character_detail'); 
});

app.get('/characters', (req, res) => {
    res.render('characters'); 
});

app.get('/favorite_characters', (req, res) => {
    res.render('favorite_characters'); 
});

app.get('/favorite_detail', (req, res) => {
    res.render('favorite_detail'); 
});

app.get('/landing-page', (req, res) => {
    res.render('landing-page'); 
});

app.get('/user-profile', (req, res) => {
    res.render('user-profile'); 
});


app.listen(app.get("port"), async() => {
    try {
        await connect();
        console.log("Server started on http://localhost:" + app.get('port'));
    } catch (e) {
        console.log(e);
        process.exit(1); 
    }
});
