import {Column, Entity, JoinColumn, ManyToOne, PrimaryColumn} from "typeorm";
import {Board} from "./board.model";
import {Group} from "./group.model";
import {MemberResponse} from "groupo-shared-service/apiutils/messages";

@Entity("member")
export class Member {
    @PrimaryColumn({name: "email"}) email: string;

    @ManyToOne(() => Board, board => board.groups, {primary: true, eager: true})
    @JoinColumn({name: "board_id"})
    board: Board;

    @ManyToOne(() => Group, group => group.members, {nullable: true, eager: true})
    @JoinColumn({name: "group_id"})
    group: Group;

    constructor(email: string, board: Board) {
        this.email = email;
        this.board = board;
    }

    async response(): Promise<MemberResponse> {
        return {
            email: this.email,
            boardID: this.board.boardID,
            groupID: this.group ? this.group.groupID : null,
        };
    }
}
