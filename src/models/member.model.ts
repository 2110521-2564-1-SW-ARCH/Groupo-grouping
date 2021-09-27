import {Entity, JoinColumn, ManyToOne, PrimaryColumn} from "typeorm";
import {Board} from "./board.model";
import {Group} from "./group.model";

@Entity("member")
export class Member {
    @PrimaryColumn({name: "email"}) email: string;

    @ManyToOne(() => Board, board => board.groups, {primary: true})
    @JoinColumn({name: "board_id"})
    board: Board;

    @ManyToOne(() => Group, group => group.members)
    @JoinColumn({name: "group_id"})
    group: Group;

    constructor(email: string, board: Board) {
        this.email = email;
        this.board = board;
    }
}
