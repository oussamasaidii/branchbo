import {Collection, MongoClient } from "mongodb";
import { User } from "./interfaces";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();


export const uri = "mongodb+srv://TiltedTowers:TiltedTowersBOM@cluster0.iwefcqe.mongodb.net/";
export const client = new MongoClient(uri);

export const usersCollection: Collection<User> = client.db("users").collection<User>("usersCollection");

const saltRounds : number = 10;

async function createInitialUser() {
    if (await usersCollection.countDocuments() > 0) {
        return;
    }
    const email: string | undefined = process.env.ADMIN_EMAIL;
    const password: string | undefined = process.env.ADMIN_PASSWORD;
    if (email === undefined || password === undefined) {
        throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment");
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await usersCollection.insertOne({
        username: "admin",
        email: email,
        password: hashedPassword,
        game: "Fortnite",
    });
}

export async function login(email: string, password: string) {
    if (email === "" || password === "") {
        throw new Error("Email en wachtwoord zijn vereist.");
    }
    const user: User | null = await usersCollection.findOne<User>({ email: email });
    if (user) {
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (passwordMatch) {
            return user;
        } else {
            throw new Error("Verkeerd wachtwoord!");
        }
    } else {
        throw new Error("Gebruiker niet gevonden, maak een account aan.");
    }
}

async function exit() {
    try {
        await client.close();
        console.log("Disconnected from database");
    } catch (error) {
        console.error(error);
    }
    process.exit(0);
}

export async function connect() {
    try {
        await client.connect();
        await createInitialUser();
        console.log("Connected to database");
        process.on("SIGINT", exit);
    } catch (error) {
        console.error(error);
    }
}