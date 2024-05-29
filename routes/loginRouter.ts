import express, { Express } from "express";
import ejs from "ejs";
import dotenv from "dotenv";
import path, { format } from "path";
import { connect, login } from "../database";
import session from "../session";
import { secureMiddleware } from "../session";
import { loadCharacters, charactersCollection } from "../database";
import { User } from "../interfaces";



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
    
    router.post('/character/favorite', secureMiddleware, async (req, res) => {
        try {
            const { id } = req.body;
            const character = await charactersCollection.findOne({ id: id });
            if (character) {
                const newFavoriteStatus = !character.isFavortite;
                const update: any = { isFavortite: newFavoriteStatus }; 
                if (newFavoriteStatus) {
                    update.isBlacklisted = false; 
                }
                await charactersCollection.updateOne({ id: id }, { $set: update });
                res.json({ success: true });
            } else {
                res.status(404).json({ success: false, message: 'Character not found' });
            }
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error updating favorite status' });
        }
    });

    router.post('/character/blacklist', secureMiddleware, async (req, res) => {
        try {
            const { id } = req.body;
            const character = await charactersCollection.findOne({ id: id });
            if (character) {
                const newBlacklistStatus = !character.isBlacklisted;
                const update: any = { isBlacklisted: newBlacklistStatus }; 
                if (newBlacklistStatus) {
                    update.isFavortite = false; 
                }
                await charactersCollection.updateOne({ id: id }, { $set: update });
                res.json({ success: true });
            } else {
                res.status(404).json({ success: false, message: 'Character not found' });
            }
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error updating blacklist status' });
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

    router.get('/blacklisted_characters', secureMiddleware, async (req, res) => {
        try {
            const blacklistedCharacters = await charactersCollection.find({ isBlacklisted: true }).toArray();
            res.render('blacklisted_characters', { characters: blacklistedCharacters, user: req.session.user });
        } catch (error) {
            res.status(500).send("Error loading blacklisted characters");
        }
    });

    router.get('/character_detail/:id', secureMiddleware, async (req, res) => {
        try {
            const characterId = req.params.id;
            const character = await charactersCollection.findOne({ id: characterId });
            if (character) {
                res.render('character_detail', { character, user: req.session.user });
            } else {
                res.status(404).send('Character not found');
            }
        } catch (error) {
            res.status(500).send('Error loading character details');
        }
    });

    router.get('/characters', secureMiddleware, async (req, res) => {
        try {
            const characters = await loadCharacters();
            res.render("characters", { characters, user: req.session.user });
        } catch (error) {
            res.status(500).send("Error loading characters");
        }
    });

    router.get('/favorite_characters', secureMiddleware, async (req, res) => {
        try {
            const favoriteCharacters = await charactersCollection.find({ isFavortite: true }).toArray();
            res.render('favorite_characters', { characters: favoriteCharacters, user: req.session.user });
        } catch (error) {
            res.status(500).send("Error loading favorite characters");
        }
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
