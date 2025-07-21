# aws-secrets-file-writer

Reads AWS SecretManager secrets and writes them to files based on the secret key.

## Example:

For example, if `OUTPUT_FOLDER` is set to `/tmp/secrets` and a secret with name `secret-1` has three secrets in it called `CERT`, `KEY`, and `PASSWORD` it will write the following files:

- /tmp/secrets/secret-1/CERT
- /tmp/secrets/secret-1/KEY
- /tmp/secrets/secret-1/PASSWORD

## Configurations:

- `AWS_REGION`: The region the secrets are in, for example `us-east-1`
- `OUTPUT_FOLDER`: The folder to write secrets to, for example `/tmp/secrets`
- `SECRETS_NAME_#`: The name of secrets to read, for example `SECRETS_NAME_1`=`aws-secret-1`. Multiple secrets can be read at runtime as long as it has the prefix `SECRETS_NAME_`
- `ACCESS_KEY_ID`: The ID of the key to use for authentication. Must have read access to the secrets
- `ACCESS_KEY_SECRET`: The value of the key to use for authentication
