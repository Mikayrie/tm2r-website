import bcrypt from "bcryptjs";
import { db } from "./utils.js";

export async function handler(event) {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    const { email, password } = JSON.parse(event.body);

    try {
        const client = await db();

        const result = await client.query(
            "SELECT id, password_hash, verified FROM users WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Invalid email or password." })
            };
        }

        const user = result.rows[0];

        if (!user.verified) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Email not verified. Check your inbox." })
            };
        }

        const valid = await bcrypt.compare(password, user.password_hash);

        if (!valid) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Invalid email or password." })
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, message: "Login successful!" })
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
}
