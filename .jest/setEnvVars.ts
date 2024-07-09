process.env.NODE_ENV = "test";
process.env.GCP_API_KEY = "abcdefghijklmnopqrstuvwxyz_gcp";
process.env.ANTHROPIC_API_KEY = "abcdefghijklmnopqrstuvwxyz_anthropic";
process.env.OPENAI_API_KEY = "abcdefghijklmnopqrstuvwxyz_openai";
process.env.CLEAR_ALL_ROWS = "FALSE";
process.env.DATABASE_PATH = "./.data/test-db.sqlite3";
process.env.IMAGES_PATH = "./.data/images/";
process.env.SECRET = "secret-admin-token";
// Should be undefined by default
// process.env.ALLOW_SET_SECRET;
