import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import { User } from "../interfaces";
import { usersCollection } from "../database";


export function registrationRouter(){
const router = express.Router();

router.post("/register", async (req: Request, res: Response) => {
    try {
        const { username, email, password, confirmPassword, game } = req.body;

        if (password !== confirmPassword) {
            throw new Error("Wachtwoorden komen niet overeen.");
        }
        if (game !== "Fortnite") {
            throw new Error("Enkel Fortnite is momenteel mogelijk.");
        }

        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
            throw new Error("Een account met dit e-mailadres bestaat al.");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        if (!hashedPassword) {
            throw new Error("Er is een fout opgetreden bij het hashen van het wachtwoord.");
        }

        const newUser: User = {
            username,
            email,
            password: hashedPassword,
            game
        };

        const insertionResult = await usersCollection.insertOne(newUser);
        if (!insertionResult.insertedId) {
            throw new Error("Er is een fout opgetreden bij het invoegen van de nieuwe gebruiker.");
        }

        res.status(201).send("Registratie succesvol. U kunt nu inloggen.");
        res.redirect("/login");
    } catch (error: any) {
        console.error("Fout bij registratie:", error);
        res.status(400).send(error.message);
    }
});


return router;
}