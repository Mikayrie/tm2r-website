import { Client } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import fetch from "node-fetch";

// Database connection (Netlify DB via Neon)
export async function db() {
    const client = new Client(process.env.NETLIFY_DB_URL);
    await client.connect();
    return client;
}

// Email sender using Resend
export async function sendVerificationEmail(email, token) {
    const verifyUrl = `https://tm2r-digihealth.netlify.app/.netlify/functions/verify?token=${token}`;

    await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            from: "TM2R DIGIHEALTH <noreply@tm2r.com>",
            to: email,
            subject: "Verify your TM2R DIGIHEALTH Account",
            html: `
                <h2>Welcome to TM2R DIGIHEALTH!</h2>
                <p>Please click the button below to verify your account.</p>
                <a href="${verifyUrl}" 
                    style="background:#007bff;padding:10px 20px;color:white;border-radius:6px;text-decoration:none;">
                    Verify My Account
                </a>
                <p>If the button doesn't work, open this link in your browser:</p>
                <p>${verifyUrl}</p>
            `
        })
    });
}
