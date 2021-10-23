import express from "express";
import {catcher} from "groupo-shared-service/apiutils/errors";
import * as BoardService from "../services/board.service";
import {
    BoardInvitationRequest,
    BoardResponse,
    CreateBoardRequest,
    CreateBoardResponse,
    json,
    MemberResponse,
    newAPIResponse
} from "groupo-shared-service/apiutils/messages";
import {verifyAuthorizationHeader} from "groupo-shared-service/services/authentication";
import {StatusCodes} from "http-status-codes";

const getBoardID = (req: express.Request): string => {
    return req.params.boardID;
};

/**
 * create a new board with specific groups and tags
 */
export const create: express.Handler = catcher(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const {email: owner} = verifyAuthorizationHeader(req);

    const {name, totalGroup, tags} = req.body as CreateBoardRequest;

    const boardID = await BoardService.create(owner, name, totalGroup, tags);

    json(res, newAPIResponse<CreateBoardResponse>(StatusCodes.OK, {boardID}));
    next();
});

/**
 * add new members to a board (only owner)
 */
export const addMember: express.Handler = catcher(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const {email} = verifyAuthorizationHeader(req);

    const {members} = req.body as BoardInvitationRequest;

    await BoardService.addMember(email, getBoardID(req), members);

    json(res, newAPIResponse<string>(StatusCodes.NO_CONTENT, ""));
    next();
});


/**
 * list all members of the board
 */
export const join: express.Handler = catcher(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const {email} = verifyAuthorizationHeader(req);

    await BoardService.join(email, getBoardID(req));

    json(res, newAPIResponse<string>(StatusCodes.NO_CONTENT, ""));
    next();
});

/**
 * list all members of the board
 */
export const listMember: express.Handler = catcher(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const {email} = verifyAuthorizationHeader(req);

    const members = await BoardService.listMembers(email, getBoardID(req));

    json(res, newAPIResponse<MemberResponse[]>(StatusCodes.OK, members));
    next();
});

/**
 * list all boards that the `email` is a member
 */
export const listBoard: express.Handler = catcher(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const {email} = verifyAuthorizationHeader(req);

    const boards = await BoardService.listBoards(email);

    json(res, newAPIResponse<BoardResponse[]>(StatusCodes.OK, boards));
    next();
});

/**
 * get board information
 */
export const findBoard: express.Handler = catcher(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const {email} = verifyAuthorizationHeader(req);
    json(res, newAPIResponse<BoardResponse>(StatusCodes.OK, await BoardService.findByID(email, getBoardID(req))));
    next();
});
