import {getConnection, getManager} from "typeorm";
import {Board, BoardQueryResult} from "../models/board.model";
import {Tag} from "../models/tag.model";
import {Group} from "../models/group.model";
import {Member, MemberQueryResult} from "../models/member.model";
import {UnauthorizedError} from "groupo-shared-service/apiutils/errors";
import * as MemberService from "./member.service";
import {CountQueryResult} from "./share.interface";
import {BoardResponse, GroupResponse} from "groupo-shared-service/apiutils/messages";

interface MemberGroupQueryResult {
    email: string;
    group_id: string;
    name: string;
    description: string | null;
    created_at: Date;
}

/**
 * verify if `owner` is actually the owner of `boardID`
 */
const verifyOwner = async (owner: string, boardID: string): Promise<boolean> => {
    const count = await getConnection()
        .getRepository<Board>(Board)
        .createQueryBuilder("board")
        .where("board.owner = :owner", {owner})
        .getCount();
    return count > 0;
};

/**
 * verify if `email` is a member of `boardID`
 */
const verifyMember = async (email: string, boardID: string): Promise<boolean> => {
    const result = await getManager().query(`SELECT COUNT(*) as count FROM member WHERE board_id = '${boardID}' and email = '${email}';`);
    const countResult = result[0] as CountQueryResult;
    return parseInt(countResult.count, 10) > 0;
};

/**
 * get members of `boardID`
 */
const getMembers = async (boardID: string): Promise<MemberQueryResult[]> => {
    return await getManager().query(`SELECT * FROM member WHERE board_id = '${boardID}';`);
};

/**
 * create new board with specific groups and tags
 */
export const create = async (owner: string, name: string, totalGroup: number, tags: Record<string, string[]>): Promise<string> => {
    const board = new Board(owner, name);
    await getConnection().getRepository(Board).insert(board);

    // pre create group
    const groups: Group[] = [];
    for (let i = 0; i < totalGroup; i++) {
        groups.push(new Group(board, `Group ${i + 1}`));
    }
    board.groups = Promise.resolve(groups);

    // pre create tag
    const tagList: Tag[] = [];
    for (const tag of Object.keys(tags)) {
        for (const value of tags[tag]) {
            tagList.push(new Tag(tag, value, board));
        }
    }
    board.tags = Promise.resolve(tagList);

    // automatically set owner to be a member of the board
    board.members = Promise.resolve([new Member(owner, board)]);

    await getConnection().getRepository(Board).save(board);

    return board.boardID;
};

/**
 * get board by ID
 */
export const findByID = async (boardID: string): Promise<BoardResponse> => {
    const boardSubQuery = `SELECT board_id, owner, name, updated_at FROM board WHERE board.board_id = '${boardID}'`;
    const query = `SELECT b.board_id, b.owner, b.name, b.updated_at, g.group_id, g.name as group_name, g.description as group_description FROM (${boardSubQuery}) as b INNER JOIN \`group\` as g ON g.board_id = b.board_id`;

    const boardQueryResults: BoardQueryResult[] = await getManager().query(query);

    const response = await queryResultMapping(boardQueryResults);
    return response[0];
};

/**
 * get board by ID and owner email
 */
export const findByOwnerAndID = async (owner: string, boardID: string): Promise<Board> => {
    return await getConnection().getRepository(Board).findOneOrFail({where: {owner, boardID}});
};

/**
 * add new members to specific `boardID`
 */
export const addMember = async (owner: string, boardID: string, members: string[]) => {
    if (!(await verifyOwner(owner, boardID))) {
        throw new UnauthorizedError("this user cannot add member into this board");
    }
    await getConnection()
        .createQueryBuilder()
        .insert()
        .into(Member)
        .values(members.map(email => ({email, board: {boardID}})))
        .execute();
};

/**
 * join board with `boardID`
 */
export const join = async (email: string, boardID: string) => {
    await getConnection().createQueryBuilder().insert().into(Member).values({email, board: {boardID}}).execute();
};

/**
 * list all member for specific `boardID`
 */
export const listMembers = async (email: string, boardID: string): Promise<MemberQueryResult[]> => {
    if (!(await verifyMember(email, boardID))) {
        throw new UnauthorizedError("this user cannot view member list");
    }
    return await getMembers(boardID);
};

/**
 * list all boards that this `email` is a member
 * @param email
 */
export const listBoards = async (email: string): Promise<BoardResponse[]> => {
    const memberSubQuery = `SELECT * FROM member WHERE member.email = '${email}'`;
    const boardSubQuery = `SELECT board_id, owner, name, updated_at, (m.group_id IS NOT NULL) as is_assign FROM board NATURAL JOIN (${memberSubQuery}) as m`;
    const query = `SELECT b.board_id, b.owner, b.name, b.updated_at, b.is_assign, g.group_id, g.name as group_name, g.description as group_description FROM (${boardSubQuery}) as b INNER JOIN \`group\` as g ON g.board_id = b.board_id`;

    const boardQueryResults: BoardQueryResult[] = await getManager().query(query);

    return queryResultMapping(boardQueryResults);
};

const queryResultMapping = async (boardQueryResults: BoardQueryResult[]): Promise<BoardResponse[]> => {
    const boards: Record<string, BoardResponse> = {};

    await Promise.all(boardQueryResults.map(async (result) => {
        if (!boards[result.board_id]) {
            boards[result.board_id] = {
                boardID: result.board_id,
                isAssign: result.is_assign !== "0",
                owner: result.owner,
                name: result.name,
                groups: [],
                unAssignedMember: [],
            };
        }
        boards[result.board_id].groups.push({
            groupID: result.group_id,
            name: result.group_name,
            description: result.group_description,
            members: [],
        });
    }));

    await Promise.all(Object.values(boards).map(async (board) => {
        const members = await getMembers(board.boardID);
        for (const m of members.filter(e => e.group_id !== null)) {
            board.groups.find(g => g.groupID === m.group_id).members.push(m.email);
        }
        board.unAssignedMember = members.filter(e => e.group_id === null).map(e => e.email);
    }));

    return Object.values(boards);
}
