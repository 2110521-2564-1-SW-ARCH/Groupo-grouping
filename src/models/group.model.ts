import {Column, Entity, Generated, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Board} from "./board.model";
import {Member} from "./member.model";

@Entity("group")
export class Group {
    @PrimaryGeneratedColumn("uuid", {name: "group_id"}) groupID: string;

    @ManyToOne(() => Board, board => board.groups)
    @JoinColumn({name: "board_id"})
    board: Board;

    @OneToMany(() => Member, member => member.group)
    members: Member[];

    constructor(board: Board) {
        this.board = board;
    }
}
