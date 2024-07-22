import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm"
import { credential } from "./credential"
import { appoiments } from "./appoiments"

@Entity({

    name:"users"
})
export class user{
    
    @PrimaryGeneratedColumn()
    id: number

    @Column({

        length: 100
    })
    name: string

    @Column()
    email: string

    @Column()
    birthdate: string

    @Column()
    nDni: string

    @OneToOne( () => credential )
    @JoinColumn()
    credential: credential
    
    @OneToMany(()=> appoiments,(appoiments)=>appoiments.user)
    appoiments:appoiments[]

}
