import express, { Express } from "express";
import ejs from "ejs";
import dotenv from "dotenv";
import path, { format } from "path";
import { connect, login } from "../database";
import session from "../session";
import { secureMiddleware } from "../session";
import { loadCharacters, charactersCollection, usersCollection } from "../database";
import { User } from "../interfaces";
import { ObjectId } from 'mongodb';

export function loginRouter() {
    const router = express.Router();

    router.get("/login", async (req, res) => {
        res.render("login", { errorMessage: null });
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

    router.post('/update-username', secureMiddleware, async (req, res) => {
        if (req.session && req.session.user) {
            try {
                const userId = req.session.user._id;
                const newUsername = req.body.username;

                await usersCollection.updateOne(
                    { _id: new ObjectId(userId) },
                    { $set: { username: newUsername } }
                );

                req.session.user.username = newUsername;

                res.redirect('/user-profile?message=Gebruikersnaam succesvol bijgewerkt.');
            } catch (error) {
                console.error("Error updating username:", error);
                res.redirect('/user-profile?message=Fout bij het bijwerken van de gebruikersnaam.');
            }
        } else {
            res.status(401).redirect('/login');
        }
    });

    router.post('/character/win', secureMiddleware, async (req, res) => {
        try {
            const { id } = req.body;
            const character = await charactersCollection.findOne({ id: id });
            if (character) {
                await charactersCollection.updateOne(
                    { id: id },
                    { $inc: { wins: 1 } }
                );
                res.json({ success: true });
            } else {
                res.status(404).json({ success: false, message: 'Character not found' });
            }
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error updating wins' });
        }
    });

    router.post('/character/loss', secureMiddleware, async (req, res) => {
        try {
            const { id } = req.body;
            const character = await charactersCollection.findOne({ id: id });
            if (character) {
                await charactersCollection.updateOne(
                    { id: id },
                    { $inc: { losses: 1 } }
                );
                res.json({ success: true });
            } else {
                res.status(404).json({ success: false, message: 'Character not found' });
            }
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error updating losses' });
        }
    });

    router.post('/character/removeFromBlacklist', secureMiddleware, async (req, res) => {
        try {
            const { id } = req.body;
            const character = await charactersCollection.findOne({ id: id });
            if (!character) {
                return res.status(404).json({ success: false, message: 'Character not found' });
            }

            const updateResult = await charactersCollection.updateOne(
                { id: id },
                { $unset: { isBlacklisted: "" } }
            );

            if (updateResult.modifiedCount === 0) {
                throw new Error('No changes were made');
            }

            res.json({ success: true });
        } catch (error) {
            console.error('Failed to remove from blacklist:', error);
            res.status(500).json({ success: false, message: 'Failed to remove from blacklist' });
        }
    });

    router.post('/update-blacklist-reason', secureMiddleware, async (req, res) => {
        if (req.session && req.session.user) {
            const { characterId, reasonBlacklist } = req.body;
    
            try {
                // Controleer of characterId een geldige ObjectId is
                if (!ObjectId.isValid(characterId)) {
                    return res.status(400).json({ success: false, message: 'Invalid character ID' });
                }
    
                const objectId = new ObjectId(characterId);
    
                // Update de reasonBlacklist-veld in de MongoDB-collectie
                const updateResult = await charactersCollection.updateOne(
                    { _id: objectId },
                    { $set: { reasonBlacklist: reasonBlacklist } }
                );
    
                if (updateResult.modifiedCount === 0) {
                    return res.status(404).json({ success: false, message: 'Character not found or no changes made' });
                }
    
                res.json({ success: true, message: 'Blacklist reason updated successfully' });
            } catch (error) {
                console.error("Error updating blacklist reason:", error);
                res.status(500).json({ success: false, message: 'Error updating blacklist reason' });
            }
        } else {
            res.status(401).json({ success: false, message: 'Unauthorized' });
        }
    });

    router.get('/landing-page', secureMiddleware, (req, res) => {
        res.render('landing-page', { user: req.session.user });
    });

    router.get('/homepage_fortnite', secureMiddleware, (req, res) => {
        res.render('homepage_fortnite', { user: req.session.user });
    });

    router.get('/blacklist_detail/:id', secureMiddleware, async (req, res) => {
        try {
            const characterId = req.params.id;
            const character = await charactersCollection.findOne({ id: characterId });
            if (character && character.isBlacklisted) {
                res.render('blacklist_detail', { character, user: req.session.user });
            } else {
                res.status(404).send('Blacklisted character not found or not marked as blacklisted.');
            }
        } catch (error) {
            res.status(500).send('Error loading blacklisted character details');
        }
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

    router.get('/favorite_detail/:id', secureMiddleware, async (req, res) => {
        try {
            const characterId = req.params.id;
            const character = await charactersCollection.findOne({ id: characterId });
            if (character && character.isFavortite) {
                res.render('favorite_detail', { character, user: req.session.user });
            } else {
                res.status(404).send('Favorite character not found or not marked as favorite.');
            }
        } catch (error) {
            res.status(500).send('Error loading favorite character details');
        }
    });

    router.get('/user-profile', secureMiddleware, (req, res) => {
        if (req.session && req.session.user) {
            res.render('user-profile', { user: req.session.user, message: req.query.message });
        } else {
            res.redirect('/login');
        }
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
