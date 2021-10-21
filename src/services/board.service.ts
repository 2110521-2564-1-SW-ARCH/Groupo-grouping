import {getConnection} from "typeorm";
import {Board} from "../models/board.model";
import {Tag} from "../models/tag.model";
import {Group} from "../models/group.model";
import {Member} from "../models/member.model";
import {NotFoundError, UnauthorizedError} from "groupo-shared-service/apiutils/errors";

const saveBoard = async (board: Board) => {
    for (const member of board.members) {
        member.board = board;
    }
    await getConnection().getRepository(Board).save(board);
};

export const createBoard = async (owner: string, name: string, totalGroup: number, tags: Record<string, string[]>): Promise<string> => {
    const board = new Board(owner, name, totalGroup);
    await getConnection().getRepository(Board).insert(board);

    const groups: Group[] = [];
    for (let i = 0; i < totalGroup; i++) {
        groups.push(new Group(board, "Untitled - " + (i+1)));
    }
    board.groups = Promise.resolve(groups);

    const tagList: Tag[] = [];
    for (const tag of Object.keys(tags)) {
        for (const value of tags[tag]) {
            tagList.push(new Tag(tag, value, board));
        }
    }
    board.tags = tagList;

    board.members = [new Member(owner, board)];

    await saveBoard(board);

    return board.boardID;
};

export const createGroup = async (owner: string, boardID: string, name = "Untitled", description: string | null = null): Promise<string> => {
    const board = await getConnection().getRepository(Board).findOneOrFail({where: {owner, boardID}});
    const group = new Group(board, name, description);
    return group.groupID;
}

export const updateGroup = async (owner: string, groupID: string, name = "Untitled", description: string | null = null) => {
    const group = await getConnection().getRepository(Group).findOneOrFail({where: {groupID}});
    await getConnection().getRepository(Board).findOneOrFail({where: {owner, boardID: group.board.boardID}});
    group.name = name;
    group.description = description;
    await getConnection().getRepository(Group).save(group);
}


export const deleteGroup = async (owner: string, groupID: string) => {
    const group = await getConnection().getRepository(Group).findOneOrFail({where: {groupID}});
    await getConnection().getRepository(Board).findOneOrFail({where: {owner, boardID: group.board.boardID}});
    await getConnection().getRepository(Group).delete(group);
}

export const assignToGroup = async (email: string, boardID: string, groupID: string | null) => {
    const group = await getConnection().getRepository(Group).findOneOrFail({where: {groupID}});

    if (group.board.boardID != boardID) {
        throw new NotFoundError("Group not found");
    }

    const board = await getConnection().getRepository(Board).findOneOrFail({where: {boardID}});
    const member = board.members.find(member => member.email == email);
    member.board = board;
    member.group = group;

    await getConnection().getRepository(Member).save(member);
}

export const addMember = async (owner: string, boardID: string, members: string[]) => {
    const board = await getConnection().getRepository(Board).findOneOrFail({where: {owner, boardID}});

    const memberSet: Set<string> = new Set(board.members.map(e => e.email));
    for (const member of members) {
        if (memberSet.has(member)) {
            continue;
        }
        board.members.push(new Member(member, board));
    }
    await saveBoard(board);
};

export const listMembers = async (owner: string, boardID: string, filter: (member: Member) => boolean = () => true): Promise<Member[]> => {
    const board = await getConnection().getRepository(Board).findOneOrFail({where: {owner, boardID}});
    if (!board.members.map(m => m.email).includes(owner)) {
        throw new UnauthorizedError("user cannot access this board");
    }
    return board.members.filter(filter);
};

export const acceptInvitation = async (email: string, boardID: string): Promise<Member> => {
    const board = await getConnection().getRepository(Board).findOneOrFail({where: {boardID}});
    const member = board.members.find(c => c.email == email);

    member.isJoined = true;

    await saveBoard(board);

    return member;
}

export const listBoards = async (email: string): Promise<{board: Board, isAssign: boolean}[]> => {
    const members = await getConnection()
        .createQueryBuilder(Member, "member")
        .where("member.email = :email", {email})
        .leftJoinAndSelect("member.board", "board")
        .leftJoinAndSelect("board.members", "m")
        .getMany();

    return members.map(m => ({board: m.board, isAssign: !!m.group}));
};

export const getBoard = async (email: string, boardID: string): Promise<Board> => {
    const board = await getConnection().getRepository(Board).findOneOrFail({where: {boardID}});
    // TODO : implement get info when join
    // if (!board.members.map(m => m.email).includes(email)) {
    //     throw new UnauthorizedError("user cannot access this board");
    // }



    return board;
};

export const checkOwnership = async (owner: string, boardID: string): Promise<Board> => {
    const board = await getConnection().getRepository(Board).findOneOrFail({where: {owner, boardID}});
    return board;
};
