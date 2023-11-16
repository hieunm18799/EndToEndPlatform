# Bun API Webserver

## Building
1. Create a .env folder that contain HOST, DEBUG, WS_PORT, API_PORT, ROOT_FOLDER, DATABASE_URL so the server can have the information of the server's setting.
2. Install the dependencies:
```
    bun install
```
3. Create pisma's database:
```
    npx prisma migrate dev --name init
```
## Run
```
    bun start
```