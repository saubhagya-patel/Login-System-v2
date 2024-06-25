import env from "dotenv";
env.config();
import pg from "pg";

const db = new pg.Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
})
db.connect();

const User = {
    async findByEmail(email) {
        try {
            const result = await db.query("SELECT * FROM users WHERE email=$1;", [email]);
            return result;
        } catch (error) {
            console.error("Error searching user:", error);
            throw error;
        }
    },

    async create({ name, email, hash, otp }) {
        try {
            const result = await db.query("INSERT INTO users(name, email, password, otp) VALUES($1, $2, $3, $4) RETURNING *;", [name, email, hash, otp]);
            return result;
        } catch (error) {
            console.error("Error creating user:", error);
            throw error;
        }
    },

    async delete(email) {
        try {
            const result = await db.query("DELETE FROM users WHERE email=$1;", [email]);
            return result;
        } catch (error) {
            console.error("Error deleting user:", error);
            throw error;
        }
    },

    async updatePassword({ email, hash }) {
        try {
            const result = await db.query("UPDATE users SET password=$1 WHERE email=$2 RETURNING *;", [hash, email]);
            return result;
        } catch (error) {
            console.error("Error updating otp:", error);
            throw error;
        }
    }
};

export default User;