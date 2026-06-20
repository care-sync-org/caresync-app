/**
 * AWS Secrets Manager Integration
 *
 * Called ONCE at application startup (before prisma.$connect()).
 *
 * On AWS (AWS_SECRETS_MANAGER_SECRET_NAME is set):
 *   - Fetches DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET
 *   - Injects them into process.env
 *   - Uses EC2 Instance Profile — no access keys needed
 *
 * Locally (AWS_SECRETS_MANAGER_SECRET_NAME not set):
 *   - No-op — .env values already loaded by dotenv
 *   - Local development workflow is completely unchanged
 */
export declare function initSecrets(): Promise<void>;
//# sourceMappingURL=secrets.d.ts.map