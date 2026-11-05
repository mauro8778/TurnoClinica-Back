import { Column, CreateDateColumn, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";
import { Appointment } from "./Appointment";

export type UrgencyLevel = 1 | 2 | 3 | 4 | 5;
export type TriageCategory = "resuscitation" | "emergent" | "urgent" | "semi-urgent" | "non-urgent";

@Entity({ name: "triage_assessments" })
export class TriageAssessment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.triageAssessments, { onDelete: "CASCADE" })
  user: User;

  @Column({ type: "text" })
  symptoms: string;

  @Column({ nullable: true })
  duration: string;

  @Column({ type: "int" })
  urgencyLevel: UrgencyLevel; // 1 = Más crítico, 5 = Menos crítico (Escala ESI)

  @Column({
    type: "enum",
    enum: ["resuscitation", "emergent", "urgent", "semi-urgent", "non-urgent"],
    default: "non-urgent",
  })
  category: TriageCategory;

  @Column({ length: 100 })
  recommendedSpecialty: string;

  @Column({ type: "text" })
  rationale: string;

  @Column({ type: "simple-json", nullable: true })
  redFlags: string[];

  @Column({ type: "simple-json", nullable: true })
  immediateActions: string[];

  @OneToOne(() => Appointment, (appointment) => appointment.triageAssessment, { nullable: true })
  appointment: Appointment;

  @CreateDateColumn()
  createdAt: Date;
}
