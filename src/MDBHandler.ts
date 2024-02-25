import type { Request } from "@sap/cds/apis/services"
import MDBConnection from "./MDBConnection";
import MDBParser from "./MDBParser";

export default class MDBHandler {
    private sConnectionString: string;
    private sDatabase: string;
    private oDB: MDBConnection;

    public constructor(sConnectionString : string, sDatabase: string) {
        this.sConnectionString = sConnectionString;
        this.sDatabase = sDatabase;
        this.oDB = new MDBConnection(this.sConnectionString);
    }

    /**
     * Reads the data from the MongoDB database
     * @param req The request object from the service
     * @returns The result of the read operation
     */
    public async read(req: Request) {
        await this.oDB.connect();
        const oClient = this.oDB.get();

        // Parse the request to MongoDB query
        const oParser = new MDBParser(req);
        oParser.parse();

        const sCollection = oParser.getCollection();
        const oFind = oParser.getFind();
        const oOrder = oParser.getSort();
        const oTop = oParser.getLimit();

        const aResults = await oClient
            .db(this.sDatabase)
            .collection(sCollection)
            .find(oFind)
            .sort({ [Object.keys(oOrder)[0]]: Object.values(oOrder)[0] })
            .limit(oTop.limit)
            .skip(oTop.skip)
            .toArray();
        
        console.log("Found " + aResults.length + " results");

        aResults["$count"] = aResults.length;
        return aResults;
    }

    /**
     * Creates a new entry in the MongoDB database.
     * @param req The request object from the service
     * @returns The result of the create operation
     */
    public async create(req: Request) {
        await this.oDB.connect();
        const oClient = this.oDB.get();

        // Parse the request to MongoDB query
        const oParser = new MDBParser(req);
        oParser.parse();

        await this.checkOrCreateCollection(oParser.getCollection());

        const oResult = await oClient
            .db(this.sDatabase)
            .collection(oParser.getCollection())
            .insertOne(oParser.getData());

        if (oResult.acknowledged) {
            return req.data;
        } else {
            throw new Error("Failed to insert data");
        }
    }

    /**
     * Updates an entry in the MongoDB database
     * @param req The request object from the service
     * @returns The result of the update operation
     */
    public async update(req: Request) {
        await this.oDB.connect();
        const oClient = this.oDB.get();

        // Parse the request to MongoDB query
        const oParser = new MDBParser(req);
        oParser.parse();

        const oResult = await oClient
            .db(this.sDatabase)
            .collection(oParser.getCollection())
            .updateOne(oParser.getFind(), { $set: oParser.getData() });

        if (oResult.acknowledged) {
            return req.data;
        } else {
            throw new Error("Failed to update data");
        }
    }

    /**
     * Deletes an entry from the MongoDB database
     * @param req The request object from the service
     * @returns The result of the delete operation
     */
    public async delete(req: Request) {
        await this.oDB.connect();
        const oClient = this.oDB.get();

        // Parse the request to MongoDB query
        const oParser = new MDBParser(req);
        oParser.parse();

        const oResult = await oClient
            .db(this.sDatabase)
            .collection(oParser.getCollection())
            .deleteOne(oParser.getFind());

        if (oResult.acknowledged) {
            return req.data;
        } else {
            throw new Error("Failed to delete data");
        }
    }

    /**
     * Check if a collection exists and create it if not in the MongoDB database
     * @param sCollection The collection to check or create
     */
    private async checkOrCreateCollection(sCollection: string) {
        await this.oDB.connect();
        const oClient = this.oDB.get();

        const aCollections = await oClient
            .db(this.sDatabase)
            .listCollections()
            .toArray();

        const aNames = aCollections.map((oCollection) => oCollection.name);
        if (!aNames.includes(sCollection)) {
            await oClient
                .db(this.sDatabase)
                .createCollection(sCollection);
        }
    }
}