import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { user } from "./user";


@Entity()
export class appoiments{
    
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    date: string

    @Column()
    time: string

    @Column()
    description: string;

    @Column({ default : "active" })
    status: string
    
    
    @ManyToOne(()=>user,(user)=>user.appoiments)
    user:user

}