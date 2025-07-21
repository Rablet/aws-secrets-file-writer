import { writeFileSync, existsSync, mkdirSync } from "fs";

import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const OUTPUT_FOLDER = process.env.OUTPUT_FOLDER;
if (!existsSync(OUTPUT_FOLDER)) {
  mkdirSync(OUTPUT_FOLDER);
}

const AWS_REGION = process.env.AWS_REGION;
const SECRET_ARN = process.env.SECRETS_NAME_1;

const accessKeyId = process.env.ACCESS_KEY_ID;
const accessKeySecret = process.env.ACCESS_KEY_SECRET;

const client = new SecretsManagerClient({
  region: AWS_REGION,
  credentials: {
    accessKeyId: accessKeyId,
    secretAccessKey: accessKeySecret,
  },
});

async function getSecret(secretName, secretVersion = "AWSCURRENT") {
  try {
    const command = new GetSecretValueCommand({
      SecretId: secretName,
      VersionStage: secretVersion,
    });
    const response = await client.send(command);

    if (response.SecretString) {
      // Assume json if it's a string
      return JSON.parse(response.SecretString);
    } else if (response.SecretBinary) {
      // Decode if binary
      return Buffer.from(response.SecretBinary, "base64").toString("ascii");
    }
  } catch (error) {
    console.error("Error retrieving secret:", error);
    throw error;
  }
}

(async () => {
  try {
    // Get all envs
    for (const envName in process.env) {
      // We only care about those prefixed "SECRETS_NAME"
      if (!envName.startsWith("SECRETS_NAME_")) {
        continue;
      }

      // Get the value of that env
      const secretName = process.env[envName];

      // Track dupes so we can warn
      let secretNames = [];

      const secrets = await getSecret(secretName);

      // For every item in the secret,
      // Write to a dedicated file for each secret
      for (const secretKey in secrets) {
        if (secretNames.includes(secretKey)) {
          console.warn(
            `Already added ${secretKey}. The previous one will be overwritten`
          );
        }
        secretNames.push(secretKey);

        // Write secret to file
        const secretsFolder = `${OUTPUT_FOLDER}/${secretName}`;
        if (!existsSync(secretsFolder)) {
          mkdirSync(secretsFolder);
        }

        writeFileSync(`${secretsFolder}/${secretKey}`, secrets[secretKey]);
      }
    }
  } catch (error) {
    console.error("Failed to get secrets:", error);
    process.exit(1);
  }
})();
