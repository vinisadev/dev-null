# 🗑️ /dev/null

Keep your Discord channels clutter-free with the handy /dev/null Bot! Set custom time limits for messages, and watch as your channels stay tidy and organized.

## ✨ Features

- 🕒 Set custom null timers for specific channels
- 🚀 Easy-to-use slash commands
- 🔒 Admin-only access for security
- 📊 List all null settings in your server
- 🗑️ Remove null settings when no longer needed

## 🛠️ Tech Stack

- TypeScript
- discord.js
- Prisma
- PostgreSQL

## 🚀 Quick Start

1. Clone the repository:
   ```
   git clone https://github.com/vinisadev/dev-null.git
   cd dev-null
   ```

2. Install dependencies:
   ```
   yarn
   ```

3. Set up your environment variables:
   Create a `.env` file in the root directory and add:
   ```
   BOT_TOKEN=your_discord_bot_token
   DATABASE_URL=your_postgresql_database_url
   ```

4. Set up the database:
   ```
   npx prisma migrate dev
   ```

5. Build and start the bot:
   ```
   yarn build
   yarn start
   ```

## 🎮 Usage

### Slash Commands

- `/setautonull`: Set auto-null for a channel
  - Options:
    - `channel`: The channel to set auto-null for
    - `minutes`: Number of minutes before messages are deleted

### Text Commands

All text commands use the prefix `null`.

- `null setautonull <channel> <minutes>`: Set auto-null for a channel
- `null listsettings`: List all auto-null settings in the server
- `null deletesetting <channel>`: Remove auto-null setting for a channel

**Note**: All commands require administrator privileges to use.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check [issues page](https://github.com/vinisadev/dev-null/issues).

## 📝 License

This project is [MIT](https://choosealicense.com/licenses/mit/) licensed.

## 🙋‍♂️ Support

If you have any questions or need help with setup, please open an issue or contact the maintainer.

---

Made with ❤️ and ☕ by Vin.

Happy cleaning! 🧹✨