import express from "express";
import {catcher} from "groupo-shared-service/apiutils/errors";
import {verifyAuthorizationHeader} from "groupo-shared-service/services/authentication";
import * as GroupService from "../services/group.service";
import {
    CreateGroupRequest,
    CreateGroupResponse,
    UpdateGroupRequest,
    json,
    newAPIResponse
} from "groupo-shared-service/apiutils/messages";
import {StatusCodes} from "http-status-codes";

const getGroupID = (req: express.Request): string => {
    return req.params.groupID;
};

/**
 * create a new group
 */
export const create: express.Handler = catcher(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const {email} = verifyAuthorizationHeader(req);

    const {boardID, name, description} = req.body as CreateGroupRequest;

    const groupID = await GroupService.create(email, boardID, name, description);

    json(res, newAPIResponse<CreateGroupResponse>(StatusCodes.OK, {groupID}));
    next();
});

/**
 * update group information
 */
export const update: express.Handler = catcher(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const {email} = verifyAuthorizationHeader(req);

    const {name, description} = req.body as UpdateGroupRequest;

    await GroupService.update(email, getGroupID(req), name, description);

    json(res, newAPIResponse<string>(StatusCodes.NO_CONTENT, ""));
    next();
});

/**
 * remove group with `groupID`
 */
export const remove: express.Handler = catcher(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const {email} = verifyAuthorizationHeader(req);

    await GroupService.remove(email, getGroupID(req));

    json(res, newAPIResponse<string>(StatusCodes.NO_CONTENT, ""));
    next();
});
