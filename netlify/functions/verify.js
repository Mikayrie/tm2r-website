import { db } from "./utils.js";

export async function handler(event) {
    const token = event.queryStringParameters.token;

    if (!token) {
        return { statusCode: 400, body: "Invalid verification link." };
    }

    try {
        const client = await db();

        const result = await client.query(
            "UPDATE users SET verified = true WHERE token = $1 RETURNING id",
            [token]
        );

        if (result.rows.length === 0) {
            return { statusCode: 400, body: "Invalid or expired token." };
        }

        return {
            statusCode: 200,
            headers: { "Content-Type": "text/html" },
            body: `
                <h2>Your TM2R Account is Verified!</h2>
                <p>You may now close this tab and log in.</p>
            `
        };

    } catch (error) {
        return { statusCode: 500, body: error.message };
    }
}
