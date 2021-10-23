import {getConnection} from "typeorm";
import {Member} from "../models/member.model";
import {NotFoundError} from "groupo-shared-service/apiutils/errors";

export const findByEmail = async (email: string): Promise<Member[]> => {
    return await getConnection().getRepository(Member).find({where: {email}});
};

export const findByEmailAndBoard = async (email: string, boardID: string): Promise<Member> => {
    const members = await findByEmail(email);
    const member = members.find(m => m.board.boardID === boardID);
    if (!member) {
        throw new NotFoundError();
    }
    return member;
};

export const save = async (member: Member) => {
    await getConnection().getRepository(Member).save(member);
};
