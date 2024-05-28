import express, { Express } from "express";
import ejs from "ejs";
import dotenv from "dotenv";
import path, { format } from "path";
import { connect, login } from "/workspaces/branchbo/database";
import session from "/workspaces/branchbo/session";
import { secureMiddleware } from "/workspaces/branchbo/session";

import { User } from "/workspaces/branchbo/interfaces";


export function loginRouter() {
    const router = express.Router();

    router.get("/login", async (req, res) => {
        res.render("login", { errorMessage: null});
    });

    router.post("/login", async (req, res) => {
        const email: string = req.body.email;
        const password: string = req.body.password;
        try {
            let user: User | null = await login(email, password);
            if (user !== null) {
                user.password = "";
                req.session.user = user;
                res.redirect("/landing-page");
            } else {
                throw new Error("User not found");
            }
        } catch (error: any) {
            res.redirect("/login");
        }
    });
    
    
    router.get('/landing-page', secureMiddleware, (req, res) => {
        res.render('landing-page', { user: req.session.user });
    });

    router.get('/homepage_fortnite', secureMiddleware, (req, res) => {
        res.render('homepage_fortnite', { user: req.session.user });
    });

    router.get('/blacklist_detail', secureMiddleware, (req, res) => {
        res.render('blacklist_detail', { user: req.session.user });
    });

    router.get('/blacklisted_characters', secureMiddleware, (req, res) => {
        res.render('blacklisted_characters', { user: req.session.user });
    });

    router.get('/character_detail', secureMiddleware, (req, res) => {
        res.render('character_detail', { user: req.session.user });
    });

    router.get('/characters', secureMiddleware, (req, res) => {
        res.render('characters', { user: req.session.user });
    });

    router.get('/favorite_characters', secureMiddleware, (req, res) => {
        res.render('favorite_characters', { user: req.session.user });
    });

    router.get('/favorite_detail', secureMiddleware, (req, res) => {
        res.render('favorite_detail', { user: req.session.user });
    });

    router.get('/user-profile', secureMiddleware, (req, res) => {
        res.render('user-profile', { user: req.session.user });
    });

    router.get('/registration', async (req, res) => {
        res.render('registration', { user: req.session.user });
    });

    router.post("/logout", secureMiddleware, async (req, res) => {
        try {
            req.session.destroy((err) => {
                if (err) {
                    console.error("Fout bij het vernietigen van de sessie:", err);
                }
                res.redirect("/login"); 
            });
        } catch (error: any) {
            console.error("Fout bij het uitloggen:", error);
            res.redirect("/"); 
        }
    });
    

    return router;
}