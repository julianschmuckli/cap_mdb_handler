# SAP Cloud Application Programming Model (CAP) - MongoDB Handler
An unofficial SAP CAP extension to connect to any MongoDB instance.

## Installation
```bash
npm i cap_mdb_handler
```

## Usage
```typescript
import type { Request } from "@sap/cds/apis/services"
import cds = require('@sap/cds');

// 1. Import the MDBHandler
import MDBHandler from "cap_mdb_handler";

require('dotenv').config();

module.exports = cds.service.impl(async function () {

    // 2. Create a new instance of the MDBHandler
    const oHandler = new MDBHandler(process.env["MONGO_URL"], process.env["MONGO_DB"]);

    // 3. Register the event handlers
    this.on('READ', '*', async (req : Request) => {
        return await oHandler.read(req);
    });

    this.on('CREATE', '*', async (req : Request) => {
        return await oHandler.create(req);
    });

    this.on('UPDATE', '*', async (req : Request) => {
        return await oHandler.update(req);
    });

    this.on('DELETE', '*', async (req : Request) => {
        return await oHandler.delete(req);
    });
});
```

## Configuration
The MDBHandler requires the following environment variables to be set:
- `MONGO_URL`: The URL of the MongoDB instance (beginning with `mongodb://` or `mongodb+srv://`)
- `MONGO_DB`: The name of the database to connect to