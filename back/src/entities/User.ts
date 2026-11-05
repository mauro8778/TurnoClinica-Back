import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Credential } from "./Credential";
import { Appointment } from "./Appointment";
import { TriageAssessment } from "./TriageAssessment";

export type UserRole = "patient" | "doctor" | "admin";

@Entity({ name: "users" })
@Index("IDX_USER_EMAIL", ["email"], { unique: true })
@Index("IDX_USER_DNI", ["nDni"], { unique: true })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 120 })
  name: string;

  @Column({ length: 120, unique: true })
  email: string;

  @Column({ type: "date" })
  birthdate: string;

  @Column({ length: 20, unique: true })
  nDni: string;

  @Column({
    type: "varchar",
    length: 20,
    default: "patient",
  })
  role: UserRole;

  @Column({ length: 30, nullable: true })
  phone: string;

  @OneToOne(() => Credential, { cascade: true, eager: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "credentialId" })
  credential: Credential;

  @OneToMany(() => Appointment, (appointment) => appointment.user)
  appointments: Appointment[];

  @OneToMany(() => TriageAssessment, (triage) => triage.user)
  triageAssessments: TriageAssessment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
