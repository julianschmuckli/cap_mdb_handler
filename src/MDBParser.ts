import { Query, Request } from "@sap/cds";
import { MDBLimit } from "./MDBTypes";

export default class MDBParser {
    private request: Request;
    private query: Query;

    private sCollection: string;
    private oFind: Object;
    private oSort: Object;
    private oLimit: MDBLimit;

    public constructor(request: Request) {
        this.request = request;
        this.query = request.query;
    }

    public parse(): void {
        this.sCollection = this.request.entity;
        this.oFind = this.parseFind();
        this.oSort = this.parseSort();
        this.oLimit = this.parseLimit();
    }

    private parseFind(): Object {
        const oFind: Object = {};
        if (this.query.SELECT) {
            if (this.query.SELECT.where && this.query.SELECT.where.length > 0) {
                for (const oWhere of this.query.SELECT.where) {
                    if (oWhere.ref && oWhere.ref[0]) {
                        oFind[oWhere.ref[0].id!] = oWhere.val;
                    }
                }
            }

            // Keys
            // @ts-ignore
            if (this.query.SELECT.from.ref && this.query.SELECT.from.ref[0].where && this.query.SELECT.from.ref[0].where.length > 0) {
                for (const oWhere of this.query.SELECT.from.ref) {
                    if (oWhere.where) {
                        oFind[oWhere.where[0].ref[0]] = oWhere.where[2].val;
                    }
                }
            }
        }

        if (this.query.UPDATE) {
            // @ts-ignore
            if (this.query.UPDATE.entity.ref[0].where && this.query.UPDATE.entity.ref[0].where.length > 0) {
                // @ts-ignore
                for (const oWhere of this.query.UPDATE.entity.ref) {
                    if (oWhere.where) {
                        oFind[oWhere.where[0].ref[0]] = oWhere.where[2].val;
                    }
                }
            }
        }

        if (this.query.DELETE) {
            // @ts-ignore
            if (this.query.DELETE.from.ref[0].where && this.query.DELETE.from.ref[0].where.length > 0) {
                // @ts-ignore
                for (const oWhere of this.query.DELETE.from.ref) {
                    if (oWhere.where) {
                        oFind[oWhere.where[0].ref[0]] = oWhere.where[2].val;
                    }
                }
            }
        }
        return oFind;
    }

    private parseSort(): Object {
        const oOrder: Object = {};
        if (this.query.SELECT) {
            if (this.query.SELECT.orderBy && this.query.SELECT.orderBy.length > 0) {
                for (const oOrderBy of this.query.SELECT.orderBy) {
                    // @ts-ignore
                    if (oOrderBy.ref) {
                        // @ts-ignore
                        oOrder[oOrderBy.ref[0]] = oOrderBy.sort === "asc" ? 1 : -1;
                    }
                }
            }
        }
        return oOrder;
    }

    private parseLimit(): MDBLimit {
        const oLimit : MDBLimit = { limit: 100, skip: 0 };
        if (this.query.SELECT && this.query.SELECT.limit) {
            if (this.query.SELECT.limit.rows) {
                oLimit.limit = this.query.SELECT.limit.rows.val;
            }

            if (this.query.SELECT.limit.offset) {
                oLimit.skip = this.query.SELECT.limit.offset.val;
            }
        }
        return oLimit;
    }

    public getCollection(): string {
        console.log("Using collection: " + this.sCollection);
        return this.sCollection;
    }

    public getFind(): Object {
        console.log("Using find: ", this.oFind);
        return this.oFind;
    }

    public getSort(): Object {
        console.log("Using order: ", this.oSort);
        return this.oSort;
    }

    public getLimit(): MDBLimit {
        console.log("Using limit: ", this.oLimit);
        return this.oLimit;
    }

    public getData(): Object {
        console.log("Transporting data:", this.request.data);
        return this.request.data;
    }
}