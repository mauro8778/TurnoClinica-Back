import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./User";
import { Doctor } from "./Doctor";
import { TriageAssessment } from "./TriageAssessment";

export type AppointmentStatus = "pending" | "confirmed" | "cancelled" | "completed";

@Entity({ name: "appointments" })
@Index("IDX_APPOINTMENT_SLOT", ["doctor", "date", "time"], { unique: false })
@Index("IDX_APPOINTMENT_DATE", ["date"])
@Index("IDX_APPOINTMENT_STATUS", ["status"])
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "date" })
  date: string; // YYYY-MM-DD

  @Column({ length: 10 })
  time: string; // HH:MM

  @Column({ type: "text" })
  description: string;

  @Column({
    type: "varchar",
    length: 20,
    default: "confirmed",
  })
  status: AppointmentStatus;

  @ManyToOne(() => User, (user) => user.appointments, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;

  @ManyToOne(() => Doctor, (doctor) => doctor.appointments, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "doctorId" })
  doctor: Doctor;

  @OneToOne(() => TriageAssessment, (triage) => triage.appointment, { nullable: true })
  @JoinColumn()
  triageAssessment: TriageAssessment;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
