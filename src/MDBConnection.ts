import { MongoClient, ServerApiVersion } from "mongodb";

export default class MDBConnection {
    private client: MongoClient;

    public constructor(sURI : string) {
        if (!sURI) {
            throw new Error("No MongoDB URI provided. Please provide a MONGO_URL as environment variable.");
        }

        this.client = new MongoClient(sURI, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            },
            family: 4,
            hints: undefined,
            localAddress: undefined,
            localPort: undefined,
            lookup: undefined
        });
        console.log("[mdb for cds] Mongo DB instance prepared.");
    }

    public async connect() {
        await this.client.connect();

        console.log("Connected to MongoDB");
    }
    public async disconnect() {
        await this.client.close();
    }

    public get() {
        return this.client;
    }
}