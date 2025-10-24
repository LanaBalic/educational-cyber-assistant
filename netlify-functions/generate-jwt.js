import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import fetch from "node-fetch";

export const handler = async (event) => {
  try {
    // 🔹 Putanje do ključeva koje je generirala IBM skripta
    const privateKeyPath = path.join(process.cwd(), "wxo_security_config", "client_private_key.pem");
    const publicKeyPath = path.join(process.cwd(), "wxo_security_config", "ibm_public_key.pem");

    // 🔹 Učitavanje ključeva
    const privateKey = fs.readFileSync(privateKeyPath, "utf8");
    const ibmPublicKey = fs.readFileSync(publicKeyPath, "utf8");

    // 🔹 Parsiraj dolaznu poruku iz chatboxa
    const { message } = JSON.parse(event.body);

    // 🔹 Generiraj JWT token
    const payload = {
      sub: "Educational_Cyber_Assistant_Den_Haag",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 5, // Token vrijedi 5 min
      aud: "https://eu-central-1.dl.watson-orchestrate.ibm.com",
    };

    const token = jwt.sign(payload, privateKey, { algorithm: "RS256" });

    // 🔹 Pošalji poruku WatsonX Orchestrate chatbotu
    const response = await fetch("https://eu-central-1.dl.watson-orchestrate.ibm.com/api/v1/assistant/message", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: { text: message },
      }),
    });

    const data = await response.json();

    // 🔹 Vrati odgovor frontend-u
    return {
      statusCode: 200,
      body: JSON.stringify({
        reply: data.output?.generic?.[0]?.text || "No response from Watson Assistant",
      }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

