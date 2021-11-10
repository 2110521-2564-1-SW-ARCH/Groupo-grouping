import {Column, Entity, JoinColumn, ManyToOne, PrimaryColumn} from "typeorm";
import {Board} from "./board.model";
import {Group} from "./group.model";

export interface MemberQueryResult {
    email: string;
    board_id: string;
    group_id: string | null;
    tag: string | null;
    tags: string | null;
}

@Entity("member")
export class Member {
    @PrimaryColumn({name: "email"}) email: string;

    @ManyToOne(() => Board, board => board.groups, {primary: true, eager: true})
    @JoinColumn({name: "board_id"})
    board: Board;

    @ManyToOne(() => Group, group => group.members, {nullable: true, eager: true})
    @JoinColumn({name: "group_id"})
    group: Group;

    @Column("text", {nullable: true}) tag: string;
    @Column("text", {nullable: true}) tags: string;

    constructor(email: string, board: Board) {
        this.email = email;
        this.board = board;
        this.tag = null;
        this.tags = "[]";
    }
}
