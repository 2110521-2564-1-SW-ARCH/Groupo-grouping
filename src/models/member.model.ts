import {Column, Entity, JoinColumn, ManyToOne, PrimaryColumn} from "typeorm";
import {Board} from "./board.model";
import {Group} from "./group.model";

export interface MemberResponse {
    email: string;
    boardID: string,
    groupID: string;
    isJoined: boolean;
}

@Entity("member")
export class Member {
    @PrimaryColumn({name: "email"}) email: string;

    @ManyToOne(() => Board, board => board.groups, {primary: true, eager: true})
    @JoinColumn({name: "board_id"})
    board: Board;

    @ManyToOne(() => Group, group => group.members, {eager: true})
    @JoinColumn({name: "group_id"})
    group: Group;

    @Column({name: "is_joined", default: false})
    isJoined: boolean;

    constructor(email: string, board: Board) {
        this.email = email;
        this.board = board;
    }

    response(): MemberResponse {
        return {
            email: this.email,
            boardID: this.board.boardID,
            groupID: this.group.groupID,
            isJoined: this.isJoined,
        };
    }
}
