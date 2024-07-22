import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()

export class credential{
    
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    username: string

    @Column()
    password: string

}