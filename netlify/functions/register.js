import bcrypt from "bcryptjs";
import crypto from "crypto";
import { db, sendVerificationEmail } from "./utils.js";

export async function handler(event) {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    const { firstname, lastname, email, password } = JSON.parse(event.body);

    try {
        const client = await db();

        // Check if email already exists
        const exists = await client.query(
            "SELECT id FROM users WHERE email = $1",
            [email]
        );

        if (exists.rows.length > 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Email already registered." })
            };
        }

        const hashed = await bcrypt.hash(password, 10);
        const token = crypto.randomUUID();

        // Insert user
        await client.query(
            `
            INSERT INTO users (firstname, lastname, email, password_hash, verified, token)
            VALUES ($1, $2, $3, $4, $5, $6)
            `,
            [firstname, lastname, email, hashed, false, token]
        );

        // Send verification email
        await sendVerificationEmail(email, token);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Account created! Check your email to verify your account."
            })
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
}
