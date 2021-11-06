import {getConnection, getManager} from "typeorm";
import {Board, BoardQueryResult} from "../models/board.model";
import {Group} from "../models/group.model";
import {Member, MemberQueryResult} from "../models/member.model";
import {UnauthorizedError} from "groupo-shared-service/apiutils/errors";
import {CountQueryResult} from "./interface";
import {BoardResponse, MemberResponse} from "groupo-shared-service/apiutils/messages";

/**
 * verify if an `email` is actually the owner of `boardID`
 */
export const isOwner = async (email: string, boardID: string): Promise<boolean> => {
    const result = await getManager().query(`SELECT COUNT(*) as count FROM board WHERE board_id = '${boardID}' and owner = '${email}';`);
    const countResult = result[0] as CountQueryResult;
    return parseInt(countResult.count, 10) > 0;
};

/**
 * verify if an `email` is a member of `boardID`
 */
export const isMember = async (email: string, boardID: string): Promise<boolean> => {
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
export const create = async (owner: string, name: string, totalGroup: number, tags: string[]): Promise<string> => {
    const board = new Board(owner, name, tags);
    await getConnection().getRepository(Board).insert(board);

    // pre create group
    const groups: Group[] = [];
    for (let i = 0; i < totalGroup; i++) {
        groups.push(new Group(board, `Group ${i + 1}`));
    }
    board.groups = Promise.resolve(groups);

    // automatically set owner to be a member of the board
    board.members = Promise.resolve([new Member(owner, board)]);

    await getConnection().getRepository(Board).save(board);

    return board.boardID;
};

/**
 * get board by ID
 */
export const findByID = async (email: string, boardID: string): Promise<BoardResponse> => {
    const boardSubQuery = `SELECT board_id, owner, name, tags, updated_at FROM board WHERE board.board_id = '${boardID}'`;
    const query = `SELECT b.board_id, b.owner, b.name, b.tags, b.updated_at, g.group_id, g.name as group_name, g.description as group_description FROM (${boardSubQuery}) as b INNER JOIN \`group\` as g ON g.board_id = b.board_id`;

    const boardQueryResults: BoardQueryResult[] = await getManager().query(query);

    const response = await queryResultMapping(email, boardQueryResults);
    return response[0];
};

/**
 * add new members to specific `boardID`
 */
export const addMember = async (owner: string, boardID: string, members: string[]) => {
    if (!(await isOwner(owner, boardID))) {
        throw new UnauthorizedError();
    }
    await getConnection()
        .createQueryBuilder()
        .insert()
        .into<Member>(Member)
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
export const listMembers = async (email: string, boardID: string): Promise<MemberResponse[]> => {
    if (!(await isMember(email, boardID))) {
        throw new UnauthorizedError();
    }

    const memberQueryResult = await getMembers(boardID);

    return memberQueryResult.map(m => {
        return {
            email: m.email,
            boardID: m.board_id,
            groupID: m.group_id,
        };
    });
};

/**
 * list all boards that this `email` is a member
 * @param email
 */
export const listBoards = async (email: string): Promise<BoardResponse[]> => {
    const memberSubQuery = `SELECT * FROM member WHERE member.email = '${email}'`;
    const boardSubQuery = `SELECT board_id, owner, name, tags, updated_at FROM board NATURAL JOIN (${memberSubQuery}) as m`;
    const query = `SELECT b.board_id, b.owner, b.name, b.tags, b.updated_at, g.group_id, g.name as group_name, g.description as group_description FROM (${boardSubQuery}) as b INNER JOIN \`group\` as g ON g.board_id = b.board_id`;

    const boardQueryResults: BoardQueryResult[] = await getManager().query(query);

    return queryResultMapping(email, boardQueryResults);
};

const queryResultMapping = async (email: string, boardQueryResults: BoardQueryResult[]): Promise<BoardResponse[]> => {
    const boards: Record<string, BoardResponse> = {};

    // aggregate board by group
    await Promise.all(boardQueryResults.map(async (result: BoardQueryResult) => {
        const tags: string[] = JSON.parse(result.tags);

        if (!boards[result.board_id]) {
            boards[result.board_id] = {
                boardID: result.board_id,
                isAssign: false,
                owner: result.owner,
                name: result.name,
                tags: tags.map(tag => ({name: tag, members: []})),
                unTaggedMember: [],
                groups: [],
                unAssignedMember: [],
                totalGroups: 0,
                totalMembers: 0,
            };
        }
        boards[result.board_id].groups.push({
            groupID: result.group_id,
            name: result.group_name,
            description: result.group_description,
            members: [],
        });
    }));

    // append member for each boar
    await Promise.all(Object.values(boards).map(async (board) => {
        const members = await getMembers(board.boardID);
        for (const m of members.filter(e => e.group_id !== null)) {
            board.groups.find(g => g.groupID === m.group_id).members.push(m.email);
        }
        board.unAssignedMember = members.filter(e => e.group_id === null).map(e => e.email);

        for (const m of members.filter(e => e.tag !== null)) {
            console.log(m);
            board.tags.find(t => t.name === m.tag).members.push(m.email);
        }
        board.unTaggedMember = members.filter(e => e.tag === null).map(e => e.email);
        if (!!members.find(m => m.email === email) && !board.unAssignedMember.includes(email)) {
            board.isAssign = true;
        }
    }));

    Object.values(boards).forEach(board => {
        board.totalGroups = board.groups.length;
        board.totalMembers = board.unAssignedMember.length + board.groups.reduce((acc, curr) => acc + curr.members.length, 0);
    });

    return Object.values(boards);
};
