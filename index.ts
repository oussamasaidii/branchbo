import express, { Express } from "express";
import ejs from "ejs";
import dotenv from "dotenv";
import path, { format } from "path";
import { connect, login } from "./database";
import session from "./session";
import { secureMiddleware } from "./session";

import { User } from "./interfaces";

dotenv.config();

const app : Express = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(session);
app.set('views', path.join(__dirname, "views"));
app.set("port", process.env.PORT || 3000);


app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        let user: User | null = await login(email, password);
        if (user !== null) {
            user.password = ""; 
            req.session.user = user;
            res.redirect('/landing-page');
        } else {
            throw new Error("User not found");
        }
    } catch (error) {
        res.render('index', { errorMessage: (error as Error).message });
    }
});

// app.get("/", async (req, res) => {
//     res.render("index", { errorMessage: null });
// });

app.get("/", secureMiddleware, async(req, res) => {
    if (req.session.user) {
        res.render("landing-page", {user: req.session.user});
    } else {
        res.redirect("/");
    }
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

app.get("/logout", async(req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
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
